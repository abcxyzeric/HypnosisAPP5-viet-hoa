import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { DataService } from '../services/dataService';
import { waitForMvuReady } from '../services/mvuBridge';
import { Trophy, Scroll, ArrowLeft, CheckCircle, Lock, X, Gift, Hourglass, Star, } from 'lucide-react';
export const AchievementApp = ({ userData, onUpdateUser, onBack }) => {
    const [activeTab, setActiveTab] = useState('ACHIEVEMENTS');
    const [achievements, setAchievements] = useState([]);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState(null);
    const refreshTimerRef = useRef(null);
    const refreshCurrentTab = async () => {
        try {
            if (activeTab === 'ACHIEVEMENTS') {
                const achData = await DataService.getAchievements();
                setAchievements(achData);
            }
            else {
                const questData = await DataService.getQuests();
                setQuests(questData);
            }
        }
        catch (err) {
            console.warn('[HypnoOS] làm mới thành tựu/nhiệm vụ thất bại', err);
        }
        finally {
            setLoading(false);
        }
    };
    const requestRefresh = () => {
        if (refreshTimerRef.current !== null)
            return;
        setLoading(true);
        refreshTimerRef.current = window.setTimeout(() => {
            refreshTimerRef.current = null;
            void refreshCurrentTab();
        }, 100);
    };
    useEffect(() => {
        let stopped = false;
        requestRefresh();
        let stops = [];
        void (async () => {
            try {
                const ready = await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
                if (!ready)
                    return;
                if (stopped)
                    return;
                stops = [
                    eventOn(Mvu.events.VARIABLE_INITIALIZED, requestRefresh),
                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, requestRefresh),
                ];
            }
            catch {
                // ignore: not in tavern env
            }
        })();
        return () => {
            stopped = true;
            if (refreshTimerRef.current !== null) {
                window.clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
            stops.forEach(s => s.stop());
        };
    }, [activeTab]);
    // --- Handlers ---
    const handleClaimAchievement = async (ach) => {
        if (ach.isClaimed)
            return;
        // Client-side validation using passed userData
        if (!ach.checkCondition(userData))
            return;
        const result = await DataService.claimAchievement(ach.id, userData.mcPoints);
        if (result.success) {
            onUpdateUser({ ...userData, mcPoints: result.newPoints });
            setAchievements(prev => prev.map(a => (a.id === ach.id ? { ...a, isClaimed: true } : a)));
        }
    };
    const handleAcceptQuest = async (quest) => {
        const result = await DataService.acceptQuest(quest.id);
        if (!result.success) {
            setNotice(`nhận thất bại: ${result.message || 'không rõ nguyên nhân'}`);
            setTimeout(() => setNotice(null), 2500);
            return;
        }
        setNotice(`đã nhận nhiệm vụ: ${quest.title}`);
        setTimeout(() => setNotice(null), 2000);
        setQuests(prev => prev.map(q => (q.id === quest.id ? { ...q, status: 'ACTIVE' } : q)));
        requestRefresh();
    };
    const handleCancelQuest = async (quest) => {
        const result = await DataService.cancelQuest(quest.id);
        if (!result.success) {
            setNotice(`hủy thất bại: ${result.message || 'không rõ nguyên nhân'}`);
            setTimeout(() => setNotice(null), 2500);
            return;
        }
        setNotice(`đã hủy nhiệm vụ: ${quest.title}`);
        setTimeout(() => setNotice(null), 1500);
        setQuests(prev => prev.map(q => (q.id === quest.id ? { ...q, status: 'AVAILABLE' } : q)));
        requestRefresh();
    };
    const handleClaimQuest = async (quest) => {
        const result = await DataService.claimQuest(quest.id, userData.mcPoints);
        if (!result.success) {
            setNotice('nhiệm vụ chưa hoàn thành');
            setTimeout(() => setNotice(null), 2000);
            return;
        }
        onUpdateUser({ ...userData, mcPoints: result.newPoints });
        setNotice(`hoàn thành nhiệm vụ: +${quest.rewardMcPoints} PT`);
        setTimeout(() => setNotice(null), 2000);
        requestRefresh();
    };
    // Helper: Sort Achievements (Unlocked & Unclaimed -> Locked -> Claimed)
    const sortedAchievements = [...achievements].sort((a, b) => {
        const aUnlocked = a.checkCondition(userData);
        const bUnlocked = b.checkCondition(userData);
        // 1. Unlocked but Unclaimed first
        if (aUnlocked && !a.isClaimed && (!bUnlocked || b.isClaimed))
            return -1;
        if (bUnlocked && !b.isClaimed && (!aUnlocked || a.isClaimed))
            return 1;
        // 2. Locked second
        if (!aUnlocked && !a.isClaimed && b.isClaimed)
            return -1;
        if (!bUnlocked && !b.isClaimed && a.isClaimed)
            return 1;
        return 0;
    });
    const activeQuestCount = quests.filter(q => q.status === 'ACTIVE' || q.status === 'COMPLETED').length;
    return (_jsxs("div", { className: "h-full flex flex-col bg-slate-900 text-white animate-fade-in relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none" }), _jsxs("div", { className: "px-4 py-4 pt-6 flex items-center justify-between z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-white/10 transition-colors", children: _jsx(ArrowLeft, { className: "text-gray-300", size: 20 }) }), _jsx("h1", { className: "text-lg font-bold tracking-wide", children: "thành tựu và nhiệm vụ" })] }), _jsxs("div", { className: "flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20", children: [_jsx(Star, { size: 14, className: "text-amber-400 fill-amber-400" }), _jsx("span", { className: "text-sm font-bold text-amber-100", children: userData.mcPoints })] })] }), _jsxs("div", { className: "flex p-4 gap-4 z-10", children: [_jsxs("button", { onClick: () => setActiveTab('ACHIEVEMENTS'), className: `flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${activeTab === 'ACHIEVEMENTS'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'}`, children: [_jsx(Trophy, { size: 16 }), " danh sách thành tựu"] }), _jsxs("button", { onClick: () => setActiveTab('QUESTS'), className: `flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${activeTab === 'QUESTS'
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'}`, children: [_jsx(Scroll, { size: 16 }), " nhiệm vụ"] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-4 pb-8 space-y-4 no-scrollbar z-10", children: [loading && _jsx("div", { className: "text-center text-gray-500 py-10", children: "Loading data..." }), !loading && notice && (_jsx("div", { className: "px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80", children: notice })), !loading && activeTab === 'ACHIEVEMENTS' && (_jsx("div", { className: "space-y-3", children: sortedAchievements.map(ach => {
                            const isUnlocked = ach.checkCondition(userData);
                            return (_jsx("div", { className: `
                    relative p-4 rounded-2xl border transition-all duration-300
                    ${ach.isClaimed
                                    ? 'bg-slate-800/50 border-white/5 opacity-60'
                                    : isUnlocked
                                        ? 'bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                        : 'bg-slate-800/30 border-white/5'}
                 `, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${isUnlocked ? 'bg-indigo-500/20' : 'bg-gray-700/30'}`, children: ach.isClaimed ? (_jsx(CheckCircle, { size: 20, className: "text-gray-400" })) : isUnlocked ? (_jsx(Trophy, { size: 20, className: "text-indigo-400" })) : (_jsx(Lock, { size: 20, className: "text-gray-500" })) }), _jsxs("div", { children: [_jsx("h3", { className: `font-bold text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`, children: ach.title }), _jsx("p", { className: "text-xs text-gray-400 mt-1 pr-4", children: ach.description })] })] }), ach.isClaimed ? (_jsx("span", { className: "text-xs font-medium text-gray-500 py-1 px-2", children: "đã nhận" })) : isUnlocked ? (_jsxs("button", { onClick: () => handleClaimAchievement(ach), className: "bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1 animate-pulse", children: [_jsx(Gift, { size: 12 }), "nhận ", ach.rewardMcPoints, " PT"] })) : (_jsx("div", { className: "flex flex-col items-end", children: _jsxs("span", { className: "text-xs font-bold text-indigo-400/50", children: ["+", ach.rewardMcPoints, " PT"] }) }))] }) }, ach.id));
                        }) })), !loading && activeTab === 'QUESTS' && (_jsxs("div", { className: "space-y-3 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between text-[11px] text-white/60 px-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Scroll, { size: 14, className: "text-white/60" }), _jsx("span", { children: "nhiệm vụ có thể nhận/đang làm" })] }), _jsxs("div", { className: "text-white/60", children: ["đang làm đồng thời: ", _jsx("span", { className: "text-white font-bold", children: activeQuestCount }), "/3"] })] }), quests.map(q => {
                                const statusLabel = q.status === 'COMPLETED'
                                    ? 'có thể nộp'
                                    : q.status === 'ACTIVE'
                                        ? 'đang làm'
                                        : q.status === 'CLAIMED'
                                            ? 'đã hoàn thành'
                                            : 'có thể nhận';
                                const icon = q.status === 'COMPLETED' ? (_jsx(Gift, { size: 18, className: "text-amber-300" })) : q.status === 'ACTIVE' ? (_jsx(Hourglass, { size: 18, className: "text-white/70" })) : q.status === 'CLAIMED' ? (_jsx(Lock, { size: 18, className: "text-gray-500" })) : (_jsx(Scroll, { size: 18, className: "text-white/70" }));
                                const canAccept = q.status === 'AVAILABLE' && activeQuestCount < 3;
                                const canClaim = q.status === 'COMPLETED';
                                const canCancel = q.status === 'ACTIVE' || q.status === 'COMPLETED';
                                return (_jsx("div", { className: `
                    relative p-4 rounded-2xl border transition-all duration-300
                    ${q.status === 'COMPLETED'
                                        ? 'bg-amber-900/15 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                                        : q.status === 'ACTIVE'
                                            ? 'bg-white/5 border-white/10'
                                            : q.status === 'CLAIMED'
                                                ? 'bg-slate-800/40 border-white/5 opacity-60'
                                                : 'bg-slate-800/30 border-white/5'}
                 `, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-white/5 border border-white/10", children: icon }), _jsxs("div", { children: [_jsxs("h3", { className: "font-bold text-sm text-white flex items-center gap-2", children: [q.title, _jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70", children: statusLabel })] }), _jsxs("p", { className: "text-xs text-gray-400 mt-1 pr-4", children: ["điều kiện hoàn thành: ", q.description] }), _jsxs("div", { className: "text-[10px] text-amber-200/80 mt-2 font-bold", children: ["thưởng: +", q.rewardMcPoints, " PT"] })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [canAccept && (_jsx("button", { onClick: () => void handleAcceptQuest(q), className: "bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-white/10", children: "nhận" })), q.status === 'AVAILABLE' && !canAccept && (_jsx("span", { className: "text-[10px] text-white/50", children: "đã đầy(3)" })), canClaim && (_jsxs("button", { onClick: () => void handleClaimQuest(q), className: "bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1", children: [_jsx(Gift, { size: 12 }), " nộp"] })), canCancel && (_jsxs("button", { onClick: () => void handleCancelQuest(q), className: "bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-semibold py-1 px-2 rounded-lg border border-white/10 flex items-center gap-1", children: [_jsx(X, { size: 12 }), " hủy"] })), q.status === 'CLAIMED' && _jsx("span", { className: "text-[10px] text-white/50", children: "đã khóa" })] })] }) }, q.id));
                            }), quests.length === 0 && (_jsx("div", { className: "p-5 rounded-2xl border border-white/10 bg-white/5 text-xs text-white/60", children: "hiện không có nhiệm vụ khả dụng." }))] }))] })] }));
};
