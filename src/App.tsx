import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from './components/OS/StatusBar';
import { HypnosisApp, HypnoLogoSVG } from './components/HypnosisApp';
import { AchievementApp } from './components/AchievementApp'; // Import new component
import { BodyStatsApp, CalendarApp, HelpApp, InventoryApp, WipApp } from './components/CommonApps';
import { DataService } from './services/dataService';
import { waitForMvuReady } from './services/mvuBridge';
import { AppMode } from './types';
import { Activity, Calendar, HelpCircle, Trophy, Globe, Package } from 'lucide-react';
const FALLBACK_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    mcPoints: 25,
    totalConsumedMc: 0,
    money: 6000,
    suspicion: 0,
};
function withTimeout(promise, timeoutMs, label) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
        return promise;
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs);
        promise.then(value => {
            window.clearTimeout(timer);
            resolve(value);
        }, err => {
            window.clearTimeout(timer);
            reject(err);
        });
    });
}
const App = () => {
    // Global State
    const [currentApp, setCurrentApp] = useState(AppMode.HOME);
    const [userData, setUserData] = useState(null);
    const [bodyStatsUnlocked, setBodyStatsUnlocked] = useState(false);
    const [systemTimeText, setSystemTimeText] = useState(undefined);
    const [systemDateText, setSystemDateText] = useState(undefined);
    const [localNow, setLocalNow] = useState(() => new Date());
    const userRefreshInFlightRef = useRef(false);
    // Initialize Data
    useEffect(() => {
        let stopped = false;
        let retryTimer = null;
        let attempt = 0;
        const load = async () => {
            attempt += 1;
            try {
                const data = await withTimeout(DataService.getUserData(), 4000, 'DataService.getUserData');
                if (stopped)
                    return;
                setUserData(data);
            }
            catch (err) {
                console.warn('[HypnoOS] khởi tạo dữ liệu người dùng thất bại, sẽ thử lại', err);
                if (stopped)
                    return;
                if (attempt >= 10) {
                    setUserData(FALLBACK_USER_DATA);
                    return;
                }
                retryTimer = window.setTimeout(() => void load(), Math.min(1000, 150 * attempt));
            }
        };
        void load();
        return () => {
            stopped = true;
            if (retryTimer !== null)
                window.clearTimeout(retryTimer);
        };
    }, []);
    useEffect(() => {
        if (currentApp !== AppMode.HOME)
            return;
        if (systemTimeText)
            return;
        const timer = setInterval(() => setLocalNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [currentApp, systemTimeText]);
    const refreshUnlocks = async () => {
        try {
            const unlocks = await DataService.getUnlocks();
            setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);
        }
        catch (err) {
            console.warn('[HypnoOS] đọc trạng thái mở khóa thất bại', err);
            setBodyStatsUnlocked(false);
        }
    };
    useEffect(() => {
        void refreshUnlocks();
    }, []);
    const refreshUserData = async () => {
        if (userRefreshInFlightRef.current)
            return;
        userRefreshInFlightRef.current = true;
        try {
            const data = await withTimeout(DataService.getUserData(), 4000, 'DataService.getUserData');
            setUserData(data);
        }
        catch (err) {
            console.warn('[HypnoOS] làm mới dữ liệu người dùng thất bại', err);
        }
        finally {
            userRefreshInFlightRef.current = false;
        }
    };
    useEffect(() => {
        if (currentApp !== AppMode.HOME)
            return;
        let stopped = false;
        let stops = [];
        let scheduled = null;
        const refreshHomeHeader = async () => {
            try {
                const [clock, unlocks] = await Promise.all([DataService.getSystemClock(), DataService.getUnlocks()]);
                if (stopped)
                    return;
                setSystemTimeText(clock.timeText);
                setSystemDateText(clock.dateText);
                setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);
            }
            catch (err) {
                console.warn('[HypnoOS] làm mới thông tin màn hình chính thất bại', err);
            }
        };
        const requestRefresh = () => {
            if (scheduled !== null)
                return;
            scheduled = window.setTimeout(() => {
                scheduled = null;
                void refreshHomeHeader();
            }, 100);
        };
        requestRefresh();
        void (async () => {
            try {
                const ready = await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
                if (!ready)
                    return;
                if (stopped)
                    return;
                stops = [
                    eventOn(Mvu.events.VARIABLE_INITIALIZED, () => {
                        requestRefresh();
                        void refreshUserData();
                    }),
                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, requestRefresh),
                ];
            }
            catch {
                // ignore: not in tavern env
            }
        })();
        return () => {
            stopped = true;
            if (scheduled !== null)
                window.clearTimeout(scheduled);
            stops.forEach(s => s.stop());
        };
    }, [currentApp]);
    const updateUser = (data) => {
        setUserData(data);
        void DataService.updateResources(data);
    };
    // --- Router ---
    const renderCurrentApp = () => {
        if (!userData)
            return _jsx("div", { className: "h-full bg-black flex items-center justify-center text-white", children: "Loading OS..." });
        switch (currentApp) {
            case AppMode.HYPNOSIS:
                return _jsx(HypnosisApp, { userData: userData, onUpdateUser: updateUser, onExit: () => setCurrentApp(AppMode.HOME) });
            case AppMode.BODY_STATS:
                if (!bodyStatsUnlocked)
                    return (_jsx(HomeScreen, { onLaunchApp: setCurrentApp, bodyStatsUnlocked: bodyStatsUnlocked, systemTimeText: systemTimeText, systemDateText: systemDateText, localNow: localNow }));
                return _jsx(BodyStatsApp, { onBack: () => setCurrentApp(AppMode.HOME) });
            case AppMode.CALENDAR:
                return _jsx(CalendarApp, { onBack: () => setCurrentApp(AppMode.HOME) });
            case AppMode.HELP:
                return _jsx(HelpApp, { onBack: () => setCurrentApp(AppMode.HOME) });
            case AppMode.INVENTORY:
                return _jsx(InventoryApp, { onBack: () => setCurrentApp(AppMode.HOME) });
            case AppMode.ACHIEVEMENTS: // New Route
                return (_jsx(AchievementApp, { userData: userData, onUpdateUser: updateUser, onBack: () => setCurrentApp(AppMode.HOME) }));
            case AppMode.WIP:
                return _jsx(WipApp, { name: "Unknown App", onBack: () => setCurrentApp(AppMode.HOME) });
            case AppMode.HOME:
            default:
                return (_jsx(HomeScreen, { onLaunchApp: setCurrentApp, bodyStatsUnlocked: bodyStatsUnlocked, systemTimeText: systemTimeText, systemDateText: systemDateText, localNow: localNow }));
        }
    };
    return (_jsx("div", { className: "w-full flex items-center justify-center p-2", children: _jsxs("div", { className: "relative w-full max-w-[420px] aspect-[9/19.5] bg-black rounded-[3rem] border-[8px] border-gray-800 overflow-hidden shadow-2xl ring-2 ring-black/20", children: [currentApp === AppMode.HOME && (_jsx("div", { className: "absolute top-0 w-full z-50 pointer-events-none", children: _jsx(StatusBar, { timeText: systemTimeText }) })), _jsx("div", { className: "w-full h-full bg-black overflow-hidden relative", children: renderCurrentApp() }), _jsx("div", { className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full z-50 pointer-events-none mb-2" })] }) }));
};
// --- Home Screen Component ---
const HomeScreen = ({ onLaunchApp, bodyStatsUnlocked, systemTimeText, systemDateText, localNow, }) => {
    const displayTime = systemTimeText || `${localNow.getHours()}:${localNow.getMinutes().toString().padStart(2, '0')}`;
    const displayDate = systemDateText || localNow.toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' });
    const [notice, setNotice] = useState(null);
    const appendMcAnonTagToThisFloor = async () => {
        const marker = '<bản_ẩn_danh></bản_ẩn_danh>';
        try {
            const messageId = (() => {
                try {
                    return getCurrentMessageId();
                }
                catch {
                    const latest = getChatMessages(-1)[0];
                    return latest?.message_id ?? 0;
                }
            })();
            const chatMessage = getChatMessages(messageId)[0];
            if (!chatMessage)
                throw new Error(`missing chat message: ${messageId}`);
            if (chatMessage.message.includes(marker)) {
                setNotice('đã tồn tại');
                window.setTimeout(() => setNotice(null), 1500);
                return;
            }
            const base = chatMessage.message.replace(/\s+$/, '');
            const nextMessage = `${base}${base ? '\n' : ''}${marker}`;
            await setChatMessages([{ message_id: messageId, message: nextMessage }], { refresh: 'affected' });
            setNotice('đã chèn');
            window.setTimeout(() => setNotice(null), 1500);
        }
        catch (err) {
            console.warn('[HypnoOS] chèn tag bản ẩn danh thất bại', err);
            setNotice('chèn thất bại');
            window.setTimeout(() => setNotice(null), 1500);
        }
    };
    const apps = [
        {
            id: 'hypno',
            name: 'APP Thôi Miên',
            icon: HypnoLogoSVG,
            color: 'bg-gradient-to-br from-purple-600 to-pink-600',
            mode: AppMode.HYPNOSIS,
            disabled: false,
        },
        {
            id: 'calendar',
            name: 'lịch',
            icon: Calendar,
            color: 'bg-white text-black',
            mode: AppMode.CALENDAR,
            disabled: false,
        },
        { id: 'help', name: 'trợ giúp', icon: HelpCircle, color: 'bg-gray-500', mode: AppMode.HELP, disabled: false },
        // Replaced Ghost with Achievements
        {
            id: 'achievements',
            name: 'thành tựu và nhiệm vụ',
            icon: Trophy,
            color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            mode: AppMode.ACHIEVEMENTS,
            disabled: false,
        },
        {
            id: 'inventory',
            name: 'kho đồ',
            icon: Package,
            color: 'bg-emerald-600',
            mode: AppMode.INVENTORY,
            disabled: false,
        },
        {
            id: 'mc-anon',
            name: 'bản ẩn danh MC',
            icon: Globe,
            color: 'bg-blue-900',
            mode: AppMode.HOME,
            disabled: false,
            action: appendMcAnonTagToThisFloor,
        },
    ];
    const visibleApps = bodyStatsUnlocked
        ? [
            apps[0],
            {
                id: 'stats',
                name: 'kiểm tra cơ thể',
                icon: Activity,
                color: 'bg-blue-500',
                mode: AppMode.BODY_STATS,
                disabled: false,
            },
            ...apps.slice(1),
        ]
        : apps;
    return (_jsxs("div", { className: "relative h-full w-full bg-gradient-to-b from-slate-900 via-purple-950 to-black flex flex-col pt-12 pb-24 animate-fade-in", children: [_jsxs("div", { className: "px-6 mb-8 text-white/90 drop-shadow-md", children: [_jsx("div", { className: "text-6xl font-thin tracking-tighter", children: displayTime }), _jsx("div", { className: "text-lg font-medium", children: displayDate })] }), _jsx("div", { className: "flex-1 px-5 grid grid-cols-4 gap-y-6 gap-x-4 content-start", children: visibleApps.map(app => (_jsxs("div", { className: `flex flex-col items-center gap-1.5 group ${app.disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`, onClick: () => {
                        if (app.disabled)
                            return;
                        if (typeof app.action === 'function') {
                            void app.action();
                            return;
                        }
                        onLaunchApp(app.mode);
                    }, children: [_jsxs("div", { className: `
              w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center shadow-lg 
              ${!app.disabled && 'group-active:scale-90 transition-transform duration-200'}
              relative
            `, children: [_jsx(app.icon, { size: 28, className: app.id === 'calendar' ? 'text-black' : 'text-white' }), app.disabled && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl", children: _jsx("span", { className: "text-[8px] font-bold text-white bg-red-600 px-1 rounded", children: "WIP" }) }))] }), _jsx("span", { className: "text-[10px] text-white font-medium tracking-wide drop-shadow-md", children: app.name })] }, app.id))) }), notice && (_jsx("div", { className: "absolute left-1/2 -translate-x-1/2 bottom-8 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs border border-white/10 shadow-lg backdrop-blur-sm", children: notice }))] }));
};
export default App;
