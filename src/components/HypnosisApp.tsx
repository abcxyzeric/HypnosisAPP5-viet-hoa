import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { VIP_LEVELS } from '../types';
import { DataService, SUBSCRIPTION_PRICES } from '../services/dataService';
import { MvuBridge } from '../services/mvuBridge';
import { buildHypnosisSendMessage } from '../prompts/hypnosisSend';
import { Battery, Zap, Lock, ChevronDown, ChevronUp, ShoppingCart, AlertTriangle, Clock, StopCircle, RefreshCcw, ArrowLeft, } from 'lucide-react';
// --- SVG Logo Component ---
// Exported for use in App.tsx as the icon
export const HypnoLogoSVG = ({ className, size = 24, ...props }) => (_jsxs("svg", { viewBox: "0 0 200 200", className: className, width: size, height: size, ...props, children: [_jsx("defs", { children: _jsxs("filter", { id: "glow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }) }), _jsxs("g", { fill: "currentColor", filter: "url(#glow)", children: [_jsx("path", { d: "M 45 60 L 40 20 L 75 65" }), _jsx("path", { d: "M 85 55 L 100 5 L 115 55" }), _jsx("path", { d: "M 155 60 L 160 20 L 125 65" }), _jsx("path", { d: "M 10 100 C 10 40 190 40 190 100 C 190 160 10 160 10 100 Z" }), _jsx("path", { d: "M 70 145 L 100 195 L 130 145" })] }), _jsx("ellipse", { cx: "100", cy: "100", rx: "55", ry: "28", fill: "#0f0518" }), _jsx("circle", { cx: "100", cy: "100", r: "18", fill: "currentColor", filter: "url(#glow)" })] }));
// --- Vortex Background Component (Spiral SVG) ---
const VortexBackground = ({ speed = 'spin-slow' }) => {
    // Generate a spiral path
    // Center is 500, 500.
    const center = 500;
    const generateSpiralPath = (offsetAngle) => {
        let path = `M ${center} ${center} `;
        const loops = 4;
        const pointsPerLoop = 20;
        const maxRadius = 800;
        for (let i = 0; i <= loops * pointsPerLoop; i++) {
            const angle = (i / pointsPerLoop) * Math.PI * 2 + offsetAngle;
            // Exponential growth for "sucked in" look (smaller in center, wider at edges)
            const t = i / (loops * pointsPerLoop);
            const radius = Math.pow(t, 1.5) * maxRadius;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            path += `L ${x} ${y} `;
        }
        return path;
    };
    return (_jsxs("div", { className: "absolute inset-0 overflow-hidden bg-[#0f0518] pointer-events-none", children: [_jsx("div", { className: "absolute inset-[-50%] animate-[spin_4s_linear_infinite]", style: { animationDuration: speed === 'spin-slow' ? '12s' : '4s' }, children: _jsxs("svg", { viewBox: "0 0 1000 1000", className: "w-full h-full opacity-80 blur-xl", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "spiralGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#4a044e", stopOpacity: "0" }), _jsx("stop", { offset: "50%", stopColor: "#d946ef" }), _jsx("stop", { offset: "100%", stopColor: "#2563eb" })] }) }), [0, 1, 2, 3, 4, 5].map(i => (_jsx("path", { d: generateSpiralPath((i / 6) * Math.PI * 2), fill: "none", stroke: "url(#spiralGrad)", strokeWidth: 40 + i * 5, strokeLinecap: "round" }, i)))] }) }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,#000000_15%,transparent_70%)]" }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#4a044e_100%)] mix-blend-overlay opacity-60" })] }));
};
// --- Transition View (Initialization) ---
const TransitionView = () => {
    const [percent, setPercent] = useState(0);
    const [startAnim, setStartAnim] = useState(false);
    useEffect(() => {
        // 1. Start the bar animation immediately
        const timeout = setTimeout(() => {
            setStartAnim(true);
        }, 50); // Short delay to ensure mount
        // 2. Start the number counter
        const fillDuration = 3000;
        const startTime = Date.now();
        let rafId;
        const frame = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            // Calculate progress 0-100 purely for text
            let p = (elapsed / fillDuration) * 100;
            if (p > 100)
                p = 100;
            setPercent(p);
            if (p < 100) {
                rafId = requestAnimationFrame(frame);
            }
        };
        rafId = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timeout);
        };
    }, []);
    return (_jsxs("div", { className: "fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden animate-fade-in font-sans", children: [_jsx(VortexBackground, { speed: "spin" }), _jsxs("div", { className: "relative z-10 flex flex-col items-center justify-center w-full h-full pb-10", children: [_jsx("h1", { className: "text-5xl font-black text-[#d946ef] mb-12 tracking-widest select-none drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]", style: {
                            fontFamily: '"Noto Sans SC", sans-serif',
                        }, children: "APP Thôi Miên" }), _jsx("div", { className: "w-64 h-64 mb-24 animate-breathing drop-shadow-[0_0_30px_rgba(217,70,239,0.5)]", children: _jsx(HypnoLogoSVG, { className: "text-[#d946ef] w-full h-full filter drop-shadow-[0_0_10px_#ff00ff]" }) }), _jsxs("div", { className: "absolute bottom-20 w-[80%] max-w-xs", children: [_jsx("div", { className: "w-full h-6 bg-gray-900/90 border border-[#d946ef]/50 rounded-full overflow-hidden backdrop-blur-md p-1 shadow-[0_0_20px_rgba(217,70,239,0.3)]", children: _jsx("div", { className: "h-full bg-gradient-to-r from-purple-800 via-[#d946ef] to-pink-400 rounded-full shadow-[0_0_15px_#d946ef] relative", style: {
                                        width: startAnim ? '100%' : '0%',
                                        transition: 'width 3000ms linear',
                                    }, children: _jsx("div", { className: "absolute inset-0 bg-white/20 animate-pulse" }) }) }), _jsxs("div", { className: "flex justify-between mt-2 px-1", children: [_jsx("span", { className: "text-[10px] text-[#d946ef] font-mono tracking-widest animate-pulse", children: "SYSTEM INITIALIZING..." }), _jsxs("span", { className: "text-[12px] text-[#d946ef] font-mono font-bold", children: [Math.floor(percent), "%"] })] })] })] })] }));
};
// --- Active Session View (Countdown) ---
const ActiveSessionView = ({ timeLeft, sessionEndVirtualMinutes, sessionEndAtMs, onStop, }) => {
    const [remaining, setRemaining] = useState(timeLeft);
    useEffect(() => {
        let stopped = false;
        let lastRemaining = timeLeft;
        const tick = async () => {
            if (stopped)
                return;
            if (sessionEndVirtualMinutes !== null) {
                const clock = await DataService.getSystemClock();
                if (stopped)
                    return;
                if (clock.virtualMinutes !== null) {
                    const remainingMinutes = sessionEndVirtualMinutes - clock.virtualMinutes;
                    const next = Math.max(0, Math.ceil(remainingMinutes * 60));
                    setRemaining(next);
                    if (next <= 0)
                        onStop();
                    return;
                }
            }
            if (sessionEndAtMs !== null) {
                const next = Math.max(0, Math.ceil((sessionEndAtMs - Date.now()) / 1000));
                setRemaining(next);
                if (next <= 0)
                    onStop();
                return;
            }
            lastRemaining = Math.max(0, lastRemaining - 1);
            setRemaining(lastRemaining);
            if (lastRemaining <= 0)
                onStop();
        };
        void tick();
        const timer = setInterval(() => void tick(), 1000);
        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [onStop, sessionEndAtMs, sessionEndVirtualMinutes, timeLeft]);
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden animate-fade-in", children: [_jsx(VortexBackground, { speed: "spin-slow" }), _jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none" }), _jsxs("div", { className: "relative z-30 flex flex-col items-center w-full", children: [_jsx("h1", { className: "text-4xl font-bold text-[#d946ef] mb-2 tracking-widest opacity-90 select-none", style: { fontFamily: '"Noto Sans SC", sans-serif', textShadow: '0 0 10px #d946ef' }, children: "APP Thôi Miên" }), _jsx("div", { className: "text-pink-500/70 text-xs tracking-[0.5em] mb-12 uppercase font-bold animate-pulse", children: "Running..." }), _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-20 pointer-events-none animate-pulse-slow", children: _jsx(HypnoLogoSVG, { className: "text-[#d946ef] w-full h-full" }) }), _jsx("div", { className: "text-8xl font-mono font-bold text-white drop-shadow-[0_0_20px_rgba(217,70,239,1)] tabular-nums tracking-tighter mb-16 relative z-10", children: formatTime(remaining) }), _jsx("button", { onClick: onStop, className: "group relative px-10 py-4 bg-black/60 border-2 border-[#d946ef] rounded-full overflow-hidden transition-all hover:bg-[#d946ef]/20 active:scale-95 shadow-[0_0_15px_#d946ef]", children: _jsxs("span", { className: "relative z-10 text-[#d946ef] font-bold tracking-widest text-lg flex items-center gap-2", children: [_jsx(StopCircle, { size: 24 }), " giải trừ"] }) })] })] }));
};
export const HypnosisApp = ({ userData, onUpdateUser, onExit }) => {
    const normalizeDurationMinutes = (raw) => {
        const numeric = Number(raw);
        if (!Number.isFinite(numeric))
            return 1;
        const minutes = Math.floor(numeric);
        if (minutes <= 0)
            return 1;
        return Math.min(9999, minutes);
    };
    // State
    const [features, setFeatures] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false); // Controls the "Command Center" (Stats + Store)
    const [quickSupplyQtyInput, setQuickSupplyQtyInput] = useState('1');
    const containerRef = useRef(null);
    const commandCenterBaseRef = useRef(null);
    const footerControlsRef = useRef(null);
    const [commandCenterMaxHeightPx, setCommandCenterMaxHeightPx] = useState(512);
    const [durationInput, setDurationInput] = useState('10'); // Minutes
    const duration = normalizeDurationMinutes(durationInput);
    const [globalNote, setGlobalNote] = useState('');
    const [isClosing, setIsClosing] = useState(false); // For exit animation
    const [debugEnabled, setDebugEnabled] = useState(false);
    const debugToggleCountRef = useRef(0);
    const [nowVirtualMinutes, setNowVirtualMinutes] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [subscriptionNotice, setSubscriptionNotice] = useState(null);
    const [purchaseShakeFeatureId, setPurchaseShakeFeatureId] = useState(null);
    const purchaseShakeTimerRef = useRef(null);
    // Immersive Mode State
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionEndVirtualMinutes, setSessionEndVirtualMinutes] = useState(null);
    const [sessionEndAtMs, setSessionEndAtMs] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showLowEnergyModal, setShowLowEnergyModal] = useState(false);
    // Load Features on Mount
    useEffect(() => {
        let stopped = false;
        void (async () => {
            const [nextFeatures, nextDebug, nextSub] = await Promise.all([
                DataService.getFeatures(),
                DataService.getDebugEnabled().catch(() => false),
                DataService.getSubscription().catch(() => null),
            ]);
            if (stopped)
                return;
            setFeatures(nextFeatures);
            setDebugEnabled(nextDebug);
            setSubscription(nextSub);
        })();
        return () => {
            stopped = true;
        };
    }, []);
    useEffect(() => {
        return () => {
            if (purchaseShakeTimerRef.current !== null) {
                window.clearTimeout(purchaseShakeTimerRef.current);
                purchaseShakeTimerRef.current = null;
            }
        };
    }, []);
    const triggerPurchaseShake = (featureId) => {
        if (purchaseShakeTimerRef.current !== null)
            window.clearTimeout(purchaseShakeTimerRef.current);
        setPurchaseShakeFeatureId(null);
        window.requestAnimationFrame(() => {
            setPurchaseShakeFeatureId(featureId);
            containerRef.current
                ?.querySelector(`button[data-hypno-purchase="${featureId}"]`)
                ?.focus({ preventScroll: true });
        });
        purchaseShakeTimerRef.current = window.setTimeout(() => {
            setPurchaseShakeFeatureId(prev => (prev === featureId ? null : prev));
            purchaseShakeTimerRef.current = null;
        }, 500);
    };
    useEffect(() => {
        const update = () => {
            const containerEl = containerRef.current;
            const baseEl = commandCenterBaseRef.current;
            if (!containerEl || !baseEl)
                return;
            const containerHeight = containerEl.getBoundingClientRect().height;
            const footerHeight = footerControlsRef.current?.getBoundingClientRect().height ?? 0;
            const baseHeight = baseEl.getBoundingClientRect().height;
            const available = Math.max(0, containerHeight - footerHeight - baseHeight - 12);
            setCommandCenterMaxHeightPx(available);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [isExpanded]);
    useEffect(() => {
        let stopped = false;
        void (async () => {
            try {
                const end = await DataService.getSessionEnd();
                if (stopped)
                    return;
                setSessionEndVirtualMinutes(end.endVirtualMinutes);
                setSessionEndAtMs(end.endAtMs);
                let remainingSeconds = null;
                if (end.endVirtualMinutes !== null) {
                    try {
                        const clock = await DataService.getSystemClock();
                        if (!stopped && clock.virtualMinutes !== null) {
                            remainingSeconds = Math.max(0, Math.ceil((end.endVirtualMinutes - clock.virtualMinutes) * 60));
                        }
                    }
                    catch {
                        // ignore
                    }
                }
                if (remainingSeconds === null && end.endAtMs !== null) {
                    remainingSeconds = Math.max(0, Math.ceil((end.endAtMs - Date.now()) / 1000));
                }
                if (remainingSeconds !== null && remainingSeconds > 0) {
                    setTimeLeft(remainingSeconds);
                    setIsActive(true);
                    setIsTransitioning(false);
                }
                else if (end.endVirtualMinutes !== null || end.endAtMs !== null) {
                    void DataService.clearSessionEnd();
                }
            }
            catch (err) {
                console.warn('[HypnoOS] khôi phục trạng thái thôi miên thất bại', err);
            }
        })();
        return () => {
            stopped = true;
        };
    }, []);
    useEffect(() => {
        let stopped = false;
        const tick = async () => {
            try {
                const clock = await DataService.getSystemClock();
                if (stopped)
                    return;
                setNowVirtualMinutes(clock.virtualMinutes);
                const auto = await DataService.maybeAutoRenewSubscription(clock.virtualMinutes);
                if (stopped)
                    return;
                if (auto.renewed) {
                    const refreshed = await DataService.getUserData();
                    if (!stopped)
                        onUpdateUser(refreshed);
                    setSubscriptionNotice('đăng ký đã tự động gia hạn');
                    setTimeout(() => setSubscriptionNotice(null), 2000);
                }
                else if (auto.message) {
                    setSubscriptionNotice(`tự động gia hạn thất bại: ${auto.message}`);
                    setTimeout(() => setSubscriptionNotice(null), 2500);
                }
                const nextSub = await DataService.getSubscription();
                if (stopped)
                    return;
                setSubscription(nextSub);
                if (auto.renewed && nextSub?.tier) {
                    const price = SUBSCRIPTION_PRICES[nextSub.tier] ?? 0;
                    void MvuBridge.appendThisTurnAppOperationLog(`tự động gia hạn VIP${nextSub.tier.slice(3)}（-¥${price.toLocaleString()}）`);
                }
            }
            catch (err) {
                console.warn('[HypnoOS] đồng bộ đăng ký/thời gian thất bại', err);
            }
        };
        void tick();
        const timer = setInterval(() => void tick(), 1000);
        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [onUpdateUser]);
    // --- Logic Calculations ---
    useEffect(() => {
        if (duration !== 3614)
            debugToggleCountRef.current = 0;
    }, [duration]);
    const parseFirstNumber = (text) => {
        if (!text)
            return null;
        const match = text.match(/(\d+)/);
        if (!match)
            return null;
        const n = Number(match[1]);
        return Number.isFinite(n) ? n : null;
    };
    const clampInt = (value, fallback, min, max) => {
        const n = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(n))
            return fallback;
        const i = Math.floor(n);
        return Math.max(min, Math.min(max, i));
    };
    const getFeatureNumericConfig = (feature) => {
        switch (feature.id) {
            case 'vip1_temp_sensitivity':
                return { label: 'mức tăng độ nhạy', unit: 'điểm', min: 1, max: 999, step: 1, hint: 'mỗi điểm tốn 2 năng lượng MC' };
            case 'vip1_estrus':
                return { label: 'mức tăng dục vọng', unit: '', min: 1, max: 999, step: 1 };
            case 'vip1_memory_erase':
                return { label: 'thời lượng xóa ký ức', unit: 'phút', min: 1, max: 1440, step: 1 };
            case 'vip2_pleasure':
                return { label: 'ban khoái cảm', unit: '', min: 1, max: 999, step: 1, hint: 'ban một lần điểm khoái cảm cho mục tiêu' };
            default:
                return null;
        }
    };
    const getFeatureCost = (feature) => {
        if (feature.id === 'vip1_stats')
            return { energy: 0, points: 0 };
        const currency = feature.costCurrency ?? 'MC_ENERGY';
        const persons = feature.userNumber ?? parseFirstNumber(feature.userNote) ?? 1;
        let amount = 0;
        switch (feature.id) {
            case 'vip1_estrus': {
                const heat = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);
                amount = feature.costValue * heat;
                break;
            }
            case 'vip1_memory_erase': {
                const minutes = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 240);
                amount = feature.costValue * minutes;
                break;
            }
            case 'vip1_temp_sensitivity': {
                const delta = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 100);
                amount = 2 * delta;
                break;
            }
            case 'vip2_pleasure': {
                const intensity = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);
                amount = feature.costValue * intensity * duration;
                break;
            }
            case 'vip4_closed_space_common_sense': {
                amount = feature.costValue * persons * duration;
                break;
            }
            default: {
                amount = feature.costType === 'ONE_TIME' ? feature.costValue : feature.costValue * duration;
            }
        }
        if (currency === 'MC_POINTS')
            return { energy: 0, points: amount };
        return { energy: amount, points: 0 };
    };
    const accessContext = useMemo(() => ({ debugEnabled, subscription, nowVirtualMinutes }), [debugEnabled, nowVirtualMinutes, subscription]);
    const subscriptionTiers = useMemo(() => DataService.getSubscriptionTiers(), []);
    const subscriptionActive = useMemo(() => DataService.isSubscriptionActive(accessContext), [accessContext]);
    const hasAccessForFeature = (feature) => DataService.canUseFeature(feature, accessContext);
    const isPurchasedForFeature = (feature) => !feature.purchaseRequired || Boolean(feature.isPurchased);
    const canUseEnabledFeature = (feature) => hasAccessForFeature(feature) && isPurchasedForFeature(feature);
    useEffect(() => {
        const toDisable = features.filter(f => f.isEnabled && !canUseEnabledFeature(f));
        if (toDisable.length === 0)
            return;
        setFeatures(prev => prev.map(f => (!f.isEnabled || canUseEnabledFeature(f) ? f : { ...f, isEnabled: false, userNote: '' })));
        for (const f of toDisable) {
            void DataService.updateFeature(f.id, { isEnabled: false, userNote: '' });
        }
    }, [debugEnabled, features, nowVirtualMinutes, subscription, subscriptionActive]);
    const { totalEnergyCost, totalPointsCost } = useMemo(() => {
        let energy = 0;
        let points = 0;
        for (const feature of features) {
            if (!feature.isEnabled)
                continue;
            if (!canUseEnabledFeature(feature))
                continue;
            const cost = getFeatureCost(feature);
            energy += cost.energy;
            points += cost.points;
        }
        return { totalEnergyCost: energy, totalPointsCost: points };
    }, [debugEnabled, duration, features, nowVirtualMinutes, subscription, subscriptionActive]);
    const hasSessionFeaturesEnabled = useMemo(() => features.some(f => f.isEnabled && f.id !== 'vip1_stats' && canUseEnabledFeature(f)), [debugEnabled, features, nowVirtualMinutes, subscription, subscriptionActive]);
    const canSubscribeTier = (tier) => DataService.canSubscribeTier(tier, { debugEnabled, totalConsumedMc: userData.totalConsumedMc });
    const remainingSubscriptionText = useMemo(() => {
        if (debugEnabled)
            return 'DEBUG đã mở khóa';
        if (!subscription)
            return 'chưa đăng ký';
        if (nowVirtualMinutes === null)
            return 'đang đăng ký';
        const diff = subscription.endVirtualMinutes - nowVirtualMinutes;
        if (diff <= 0)
            return `đã hết hạn（VIP${subscription.tier.slice(3)}）`;
        const totalMin = Math.max(0, Math.floor(diff));
        const days = Math.floor(totalMin / (24 * 60));
        const hours = Math.floor((totalMin % (24 * 60)) / 60);
        const mins = totalMin % 60;
        const tierLabel = `VIP${subscription.tier.slice(3)}`;
        if (days > 0)
            return `${tierLabel} còn ${days} ngày ${hours.toString().padStart(2, '0')}h`;
        return `${tierLabel} còn ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }, [debugEnabled, nowVirtualMinutes, subscription]);
    const missingEnergy = Math.max(0, totalEnergyCost - userData.mcEnergy);
    const missingPoints = Math.max(0, totalPointsCost - userData.mcPoints);
    // --- Handlers ---
    const handleExitApp = () => {
        setIsClosing(true);
        setTimeout(onExit, 300); // Wait for animation
    };
    const toggleAutoRenew = async () => {
        if (!subscription)
            return;
        const next = !subscription.autoRenew;
        await DataService.setSubscriptionAutoRenew(next);
        setSubscription(prev => (prev ? { ...prev, autoRenew: next } : prev));
    };
    const subscribeTier = async (tier) => {
        if (!canSubscribeTier(tier)) {
            window.alert(`chưa mở khóa: cần tổng tiêu hao ${DataService.getSubscriptionUnlockThreshold(tier)} điểm`);
            return;
        }
        const result = await DataService.subscribeOrRenew({ tier, nowVirtualMinutes });
        if (!result.ok) {
            window.alert(result.message || 'đăng ký thất bại');
            return;
        }
        const refreshed = await DataService.getUserData();
        onUpdateUser(refreshed);
        setSubscription(result.subscription ?? null);
        setSubscriptionNotice('đăng ký thành công');
        setTimeout(() => setSubscriptionNotice(null), 2000);
        const price = SUBSCRIPTION_PRICES[tier] ?? 0;
        void MvuBridge.appendThisTurnAppOperationLog(`đăng ký VIP${tier.slice(3)}（-¥${price.toLocaleString()}）`);
    };
    const purchaseFeature = async (feature) => {
        const price = feature.purchasePricePoints ?? 0;
        const result = await DataService.purchaseFeature(feature.id);
        if (!result.ok || !result.user) {
            window.alert(result.message || 'mua thất bại');
            return;
        }
        onUpdateUser(result.user);
        setFeatures(prev => prev.map(f => (f.id === feature.id ? { ...f, isPurchased: true } : f)));
        setSubscriptionNotice(`đã mua: -${price} PT`);
        setTimeout(() => setSubscriptionNotice(null), 1500);
        void MvuBridge.appendThisTurnAppOperationLog(`mở khóa chức năng "${feature.title}"（-${price} PT）`);
    };
    const enableDebugMode = async () => {
        await DataService.setDebugEnabled(true);
        setDebugEnabled(true);
        onUpdateUser({
            ...userData,
            money: 999999,
            mcEnergy: 999999,
            mcEnergyMax: 999999,
            mcPoints: 999999,
            totalConsumedMc: 999999,
        });
    };
    const toggleFeature = (id) => {
        if (!debugEnabled) {
            if (duration === 3614 && id === 'trial_basic') {
                debugToggleCountRef.current += 1;
                if (debugToggleCountRef.current >= 10) {
                    debugToggleCountRef.current = 0;
                    void enableDebugMode();
                }
            }
            else {
                debugToggleCountRef.current = 0;
            }
        }
        const currentEnabled = features.find(f => f.id === id)?.isEnabled ?? false;
        const nextEnabled = !currentEnabled;
        const target = features.find(f => f.id === id);
        if (target && target.purchaseRequired && !target.isPurchased) {
            triggerPurchaseShake(id);
            return;
        }
        if (target && !hasAccessForFeature(target)) {
            return;
        }
        const getNumericDefault = (featureId) => {
            switch (featureId) {
                case 'vip1_temp_sensitivity':
                    return 1;
                case 'vip1_estrus':
                    return 1;
                case 'vip1_memory_erase':
                    return 10;
                case 'vip2_pleasure':
                    return 3;
                default:
                    return null;
            }
        };
        const nextNumber = nextEnabled && target && typeof target.userNumber === 'undefined' ? getNumericDefault(target.id) : null;
        setFeatures(prev => prev.map(f => f.id === id
            ? { ...f, isEnabled: !f.isEnabled, ...(nextNumber === null ? null : { userNumber: nextNumber }) }
            : f));
        void DataService.updateFeature(id, {
            isEnabled: nextEnabled,
            ...(nextNumber === null ? null : { userNumber: nextNumber }),
        });
    };
    const updateFeatureNote = (id, note) => {
        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userNote: note } : f)));
        void DataService.updateFeature(id, { userNote: note });
    };
    const updateFeatureNumber = (id, value) => {
        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userNumber: value === null ? undefined : value } : f)));
        void DataService.updateFeature(id, { userNumber: value === null ? undefined : value });
    };
    const handleStart = async () => {
        if (missingEnergy > 0 || missingPoints > 0) {
            setShowLowEnergyModal(true);
            return;
        }
        // Start Sequence
        setIsTransitioning(true);
        let endVirtualMinutes = null;
        try {
            const clock = await DataService.getSystemClock();
            if (clock.virtualMinutes !== null)
                endVirtualMinutes = clock.virtualMinutes + duration;
        }
        catch (err) {
            console.warn('[HypnoOS] đọc thời gian hệ thống thất bại, quay về đếm ngược cục bộ', err);
        }
        const endAtMs = Date.now() + duration * 60 * 1000;
        await DataService.setSessionEnd({ endVirtualMinutes, endAtMs });
        setSessionEndVirtualMinutes(endVirtualMinutes);
        setSessionEndAtMs(endAtMs);
        const enabledFeatures = features
            .filter(f => f.isEnabled && f.id !== 'vip1_stats' && canUseEnabledFeature(f))
            .map(f => f);
        // Deduct resources BEFORE sending message (the iframe may reload after chat update)
        await MvuBridge.appendThisTurnAppOperationLog(`khởi động thôi miên ${duration} phút (-${totalEnergyCost} MC${totalPointsCost > 0 ? `, -${totalPointsCost} PT` : ''})`);
        const newEnergy = Math.max(0, userData.mcEnergy - totalEnergyCost);
        const newPoints = Math.max(0, userData.mcPoints - totalPointsCost);
        const newTotalConsumed = userData.totalConsumedMc + totalEnergyCost + totalPointsCost;
        try {
            const persisted = await DataService.updateResources({
                mcEnergy: newEnergy,
                mcPoints: newPoints,
                totalConsumedMc: newTotalConsumed,
            });
            onUpdateUser(persisted);
        }
        catch (err) {
            console.warn('[HypnoOS] lưu khấu trừ tài nguyên thất bại', err);
            onUpdateUser({
                ...userData,
                mcEnergy: newEnergy,
                mcPoints: newPoints,
                totalConsumedMc: newTotalConsumed,
            });
        }
        try {
            const message = buildHypnosisSendMessage({
                features: enabledFeatures,
                durationMinutes: duration,
                globalNote,
            });
            if (typeof createChatMessages === 'function' && typeof triggerSlash === 'function') {
                await createChatMessages([{ role: 'user', message }], { refresh: 'affected' });
                await triggerSlash('/trigger');
            }
        }
        catch (err) {
            console.warn('[HypnoOS] gửi thôi miên thất bại', err);
        }
        // Mock Backend Call
        await DataService.startSession({
            startTime: Date.now(),
            durationMinutes: duration,
            selectedFeatures: enabledFeatures.map(f => ({ id: f.id, note: f.userNote })),
            globalNote,
        });
        // Transition Animation delay
        // 3200ms to allow full completion visual
        setTimeout(() => {
            setIsTransitioning(false);
            setIsActive(true);
            setTimeLeft(duration * 60); // Seconds
        }, 3200);
    };
    const handleStop = () => {
        // Fade out effect could be added here
        setIsActive(false);
        setSessionEndVirtualMinutes(null);
        setSessionEndAtMs(null);
        void DataService.clearSessionEnd();
        // Reset inputs
        setFeatures(prev => prev.map(f => (f.id === 'vip1_stats' ? f : { ...f, isEnabled: false, userNote: '' })));
        void DataService.resetFeatures();
        setGlobalNote('');
    };
    const quickSupplyQty = useMemo(() => {
        const parsed = Number.parseInt(quickSupplyQtyInput, 10);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return 1;
        return Math.min(999, parsed);
    }, [quickSupplyQtyInput]);
    const purchaseEnergy = async (desiredAmount) => {
        const unitPrice = 100;
        const amount = Math.floor(desiredAmount);
        if (!Number.isFinite(amount) || amount <= 0)
            return;
        const missing = Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy));
        const actualAmount = Math.min(missing, amount);
        if (actualAmount <= 0)
            return;
        const costMoney = unitPrice * actualAmount;
        if (userData.money < costMoney)
            return;
        const nextMoney = userData.money - costMoney;
        const nextEnergy = Math.min(userData.mcEnergyMax, userData.mcEnergy + actualAmount);
        try {
            const persisted = await DataService.updateResources({
                money: nextMoney,
                mcEnergy: nextEnergy,
            });
            onUpdateUser(persisted);
        }
        catch (err) {
            console.warn('[HypnoOS] lưu mua năng lượng thất bại', err);
            onUpdateUser({
                ...userData,
                money: nextMoney,
                mcEnergy: nextEnergy,
            });
        }
        void MvuBridge.appendThisTurnAppOperationLog(`mua năng lượng +${actualAmount} MC（-¥${costMoney.toLocaleString()}）`);
    };
    const purchaseMaxEnergy = async (desiredAmount) => {
        const amount = Math.floor(desiredAmount);
        if (!Number.isFinite(amount) || amount <= 0)
            return;
        if (userData.mcPoints < amount)
            return;
        const nextPoints = userData.mcPoints - amount;
        const nextEnergyMax = userData.mcEnergyMax + amount;
        const nextTotalConsumed = userData.totalConsumedMc + amount;
        try {
            const persisted = await DataService.updateResources({
                mcPoints: nextPoints,
                mcEnergyMax: nextEnergyMax,
                totalConsumedMc: nextTotalConsumed,
            });
            onUpdateUser(persisted);
        }
        catch (err) {
            console.warn('[HypnoOS] lưu tăng giới hạn năng lượng thất bại', err);
            onUpdateUser({
                ...userData,
                mcPoints: nextPoints,
                mcEnergyMax: nextEnergyMax,
                totalConsumedMc: nextTotalConsumed,
            });
        }
        void MvuBridge.appendThisTurnAppOperationLog(`tăng giới hạn năng lượng +${amount}（-${amount} PT）`);
    };
    const purchasePoints = async (desiredAmount) => {
        const unitPrice = 1000;
        const amount = Math.floor(desiredAmount);
        if (!Number.isFinite(amount) || amount <= 0)
            return;
        const costMoney = unitPrice * amount;
        if (userData.money < costMoney)
            return;
        const nextPoints = userData.mcPoints + amount;
        const nextMoney = userData.money - costMoney;
        try {
            const persisted = await DataService.updateResources({
                mcPoints: nextPoints,
                money: nextMoney,
            });
            onUpdateUser(persisted);
        }
        catch (err) {
            console.warn('[HypnoOS] lưu nạp điểm thất bại', err);
            onUpdateUser({
                ...userData,
                mcPoints: nextPoints,
                money: nextMoney,
            });
        }
        void MvuBridge.appendThisTurnAppOperationLog(`nạp điểm +${amount} PT（-¥${costMoney.toLocaleString()}）`);
    };
    // --- Render Helpers ---
    const renderTierSection = (tierConfig) => {
        const tierFeatures = features.filter(f => f.tier === tierConfig.tier);
        if (tierFeatures.length === 0)
            return null;
        const isLocked = !debugEnabled && userData.totalConsumedMc < tierConfig.unlockThreshold;
        const progressPercent = tierConfig.unlockThreshold === 0
            ? 100
            : Math.min(100, (userData.totalConsumedMc / tierConfig.unlockThreshold) * 100);
        const formatFeatureCost = (feature) => {
            const currency = feature.costCurrency === 'MC_POINTS' ? 'PT' : 'MC';
            if (feature.id === 'vip1_stats')
                return 'tự động mở khóa sau khi đăng ký';
            if (feature.id === 'vip1_temp_sensitivity')
                return `mỗi điểm độ nhạy: 2 ${currency}`;
            if (feature.id === 'vip1_estrus')
                return `mỗi điểm dục vọng: ${feature.costValue} ${currency}`;
            if (feature.id === 'vip1_memory_erase')
                return `mỗi phút ký ức: ${feature.costValue} ${currency}`;
            if (feature.id === 'vip4_closed_space_common_sense')
                return `mỗi người mỗi phút: ${feature.costValue} ${currency}`;
            return feature.costType === 'ONE_TIME'
                ? `một lần: ${feature.costValue} ${currency}`
                : `mỗi phút: ${feature.costValue} ${currency}`;
        };
        return (_jsxs("div", { className: "mb-6 relative", children: [_jsxs("div", { className: "flex justify-between items-center mb-2 px-1", children: [_jsx("h3", { className: "text-pink-300 font-bold text-sm tracking-wider uppercase", children: tierConfig.label }), isLocked && (_jsxs("span", { className: "text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full", children: ["cần tiêu hao ", tierConfig.unlockThreshold, " điểm"] }))] }), isLocked && (_jsxs("div", { className: "absolute inset-0 z-10 bg-hypno-dark/60 backdrop-blur-sm rounded-xl border border-white/5 flex flex-col items-center justify-center text-center p-4", children: [_jsx(Lock, { className: "w-8 h-8 text-gray-400 mb-2" }), _jsx("p", { className: "text-sm text-gray-300 font-medium", children: "khu vực chưa mở khóa" }), _jsx("div", { className: "w-full max-w-[150px] h-1.5 bg-gray-700 rounded-full mt-3 overflow-hidden", children: _jsx("div", { className: "h-full bg-pink-500 transition-all duration-500", style: { width: `${progressPercent}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [Math.floor(userData.totalConsumedMc), " / ", tierConfig.unlockThreshold, " đã tiêu hao"] })] })), _jsx("div", { className: `space-y-3 ${isLocked ? 'opacity-30 pointer-events-none select-none filter blur-[2px]' : ''}`, children: tierFeatures.map(feature => {
                        const lockedBySubscription = !hasAccessForFeature(feature);
                        const lockedByPurchase = Boolean(feature.purchaseRequired) && !feature.isPurchased;
                        const canToggle = !isLocked && !lockedBySubscription && !lockedByPurchase;
                        const purchasePricePoints = feature.purchasePricePoints ?? 0;
                        return (_jsxs("div", { className: `
                 bg-white/5 border rounded-xl overflow-hidden transition-all duration-300
                 ${lockedBySubscription || lockedByPurchase ? 'opacity-80' : ''}
                 ${feature.isEnabled && !lockedBySubscription && !lockedByPurchase
                                ? 'border-pink-500/50 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                                : 'border-white/10'}
               `, children: [_jsxs("div", { className: [
                                        'p-3 flex justify-between items-center active:bg-white/5',
                                        canToggle || lockedByPurchase ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed',
                                    ].join(' '), onClick: () => {
                                        if (isLocked)
                                            return;
                                        if (lockedByPurchase) {
                                            triggerPurchaseShake(feature.id);
                                            return;
                                        }
                                        if (lockedBySubscription) {
                                            return;
                                        }
                                        toggleFeature(feature.id);
                                    }, children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium text-gray-100 flex items-center gap-2", children: [_jsx("span", { children: feature.title }), !isLocked && lockedByPurchase && (_jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-200 flex items-center gap-1", children: [_jsx(Lock, { size: 10, className: "text-gray-300" }), " chưa mua"] })), !isLocked && lockedBySubscription && (_jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-200 flex items-center gap-1", children: [_jsx(Lock, { size: 10, className: "text-gray-300" }), " chưa đăng ký"] })), !lockedByPurchase && feature.purchaseRequired && feature.isPurchased && (_jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-200", children: "đã mua" }))] }), _jsx("div", { className: "text-xs text-gray-400 mt-0.5", children: formatFeatureCost(feature) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [lockedByPurchase && (_jsxs("button", { onClick: e => {
                                                        e.stopPropagation();
                                                        void purchaseFeature(feature);
                                                    }, disabled: userData.mcPoints < purchasePricePoints, "data-hypno-purchase": feature.id, className: [
                                                        'text-[10px] px-3 py-1.5 rounded-xl font-extrabold tracking-wide select-none',
                                                        'border border-amber-200/20 text-black',
                                                        'bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300',
                                                        'shadow-[0_6px_18px_rgba(245,158,11,0.22)]',
                                                        'transition-transform transition-shadow duration-150',
                                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70',
                                                        userData.mcPoints < purchasePricePoints
                                                            ? 'opacity-50 cursor-not-allowed grayscale'
                                                            : 'hover:shadow-[0_10px_26px_rgba(245,158,11,0.35)] active:scale-[0.97] cursor-pointer',
                                                        purchaseShakeFeatureId === feature.id ? 'hypno-shake' : '',
                                                    ].join(' '), children: ["mua ", purchasePricePoints, " PT"] })), _jsx("div", { className: `
                        w-10 h-6 rounded-full relative transition-colors duration-200
                        ${feature.isEnabled && !lockedBySubscription && !lockedByPurchase ? 'bg-pink-500' : 'bg-gray-700'}
                      `, children: _jsx("div", { className: `
                          absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm
                          ${feature.isEnabled && !lockedBySubscription && !lockedByPurchase ? 'left-5' : 'left-1'}
                        ` }) })] })] }), feature.isEnabled && !lockedBySubscription && !lockedByPurchase && (_jsxs("div", { className: "px-3 pb-3 pt-0 border-t border-white/5 animate-slide-down", children: [_jsx("p", { className: "text-xs text-gray-300 mt-2 leading-relaxed opacity-90", children: feature.description }), (() => {
                                            const cfg = getFeatureNumericConfig(feature);
                                            if (!cfg)
                                                return null;
                                            const currentRaw = feature.userNumber;
                                            const current = typeof currentRaw === 'number' && Number.isFinite(currentRaw) ? currentRaw : '';
                                            const cost = getFeatureCost(feature);
                                            const currency = feature.costCurrency ?? 'MC_ENERGY';
                                            const computed = currency === 'MC_POINTS' ? cost.points : cost.energy;
                                            const currencyLabel = currency === 'MC_POINTS' ? 'PT' : 'MC';
                                            return (_jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2 items-end", children: [_jsxs("label", { className: "col-span-1", children: [_jsxs("div", { className: "text-[10px] text-gray-400 mb-1 flex items-center justify-between gap-2", children: [_jsxs("span", { className: "truncate", children: [cfg.label, cfg.unit ? `（${cfg.unit}）` : ''] }), cfg.hint && _jsx("span", { className: "text-[10px] text-gray-500 truncate", children: cfg.hint })] }), _jsx("input", { type: "number", inputMode: "numeric", min: cfg.min, max: cfg.max, step: cfg.step ?? 1, value: current, onChange: e => {
                                                                    const raw = e.target.value;
                                                                    if (!raw) {
                                                                        updateFeatureNumber(feature.id, null);
                                                                        return;
                                                                    }
                                                                    const next = Number(raw);
                                                                    if (!Number.isFinite(next))
                                                                        return;
                                                                    const clamped = Math.max(cfg.min, Math.min(cfg.max, Math.floor(next)));
                                                                    updateFeatureNumber(feature.id, clamped);
                                                                }, className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors", placeholder: `${cfg.min}-${cfg.max}` })] }), _jsxs("div", { className: "col-span-1 text-right", children: [_jsx("div", { className: "text-[10px] text-gray-500", children: "tự tính chi phí" }), _jsxs("div", { className: "text-xs font-bold text-amber-300 tabular-nums", children: [computed, " ", currencyLabel] })] })] }));
                                        })(), feature.id !== 'vip1_stats' && (_jsx("textarea", { placeholder: feature.notePlaceholder || 'nhập ghi chú chỉ thị cụ thể tại đây...', value: feature.userNote || '', onChange: e => updateFeatureNote(feature.id, e.target.value), className: "w-full mt-3 bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors resize-none h-16" }))] }))] }, feature.id));
                    }) })] }, tierConfig.tier));
    };
    // --- Views ---
    if (isActive) {
        return (_jsx(ActiveSessionView, { timeLeft: timeLeft, sessionEndVirtualMinutes: sessionEndVirtualMinutes, sessionEndAtMs: sessionEndAtMs, onStop: handleStop }));
    }
    if (isTransitioning) {
        const target = typeof document !== 'undefined' ? document.body : null;
        if (!target)
            return _jsx(TransitionView, {});
        return createPortal(_jsx(TransitionView, {}), target);
    }
    // --- Main Dashboard View ---
    return (_jsxs("div", { ref: containerRef, className: `
      h-full flex flex-col bg-hypno-dark relative overflow-hidden font-sans
      ${isClosing ? 'animate-fade-out-down' : 'animate-slide-up'}
    `, children: [_jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-purple-900/20 rounded-full blur-[80px] pointer-events-none" }), _jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-pink-900/20 rounded-full blur-[80px] pointer-events-none" }), _jsxs("div", { className: "relative z-30 flex flex-col bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg rounded-b-2xl transition-all duration-300", children: [_jsxs("div", { ref: commandCenterBaseRef, children: [_jsxs("div", { className: "px-4 pt-3 pb-1 flex justify-between items-center cursor-pointer select-none", onClick: () => setIsExpanded(!isExpanded), children: [_jsx("button", { onClick: e => {
                                            e.stopPropagation();
                                            handleExitApp();
                                        }, className: "p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full active:bg-white/10", children: _jsx(ArrowLeft, { size: 22 }) }), _jsxs("div", { className: "flex-1 mx-4 flex flex-col justify-center", children: [_jsxs("div", { className: "flex justify-between items-end mb-1", children: [_jsx("span", { className: "text-[10px] text-pink-300 font-bold tracking-widest uppercase", children: "MC Energy" }), _jsxs("span", { className: "text-[10px] text-gray-400", children: [Math.floor(userData.mcEnergy), " / ", userData.mcEnergyMax] })] }), _jsx("div", { className: "h-1.5 w-full bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all duration-500 ${userData.mcEnergy < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`, style: { width: `${(userData.mcEnergy / userData.mcEnergyMax) * 100}%` } }) }), _jsxs("div", { className: "mt-1 flex items-center justify-between text-[9px] text-gray-500", children: [_jsxs("span", { className: "truncate", children: ["đăng ký: ", remainingSubscriptionText] }), !debugEnabled && subscription && (_jsx("span", { className: "ml-2 shrink-0", children: subscription.autoRenew ? 'tự động gia hạn: bật' : 'tự động gia hạn: tắt' }))] })] }), _jsxs("div", { className: "flex flex-col items-end min-w-[50px]", children: [_jsx("span", { className: "text-white font-bold text-lg leading-none", children: userData.mcPoints }), _jsx("span", { className: "text-[9px] text-gray-500 uppercase tracking-wider", children: "PTS" })] })] }), _jsx("div", { className: "w-full flex justify-center pb-1 cursor-pointer hover:bg-white/5 transition-colors", onClick: () => setIsExpanded(!isExpanded), children: isExpanded ? (_jsx(ChevronUp, { size: 14, className: "text-gray-500" })) : (_jsx(ChevronDown, { size: 14, className: "text-gray-500 animate-pulse" })) })] }), _jsx("div", { className: `no-scrollbar transition-[max-height,opacity] duration-300 ease-in-out ${isExpanded ? 'opacity-100 overflow-y-auto pointer-events-auto' : 'opacity-0 overflow-hidden pointer-events-none'}`, style: { maxHeight: isExpanded ? `${commandCenterMaxHeightPx}px` : '0px' }, children: _jsxs("div", { className: "px-4 pb-4 pt-2", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [_jsxs("div", { className: "bg-black/30 rounded-lg p-2 text-center border border-white/5", children: [_jsx("div", { className: "text-[10px] text-gray-400 mb-1", children: "tổng tiêu hao" }), _jsx("div", { className: "text-sm font-semibold text-white", children: Math.floor(userData.totalConsumedMc) })] }), _jsxs("div", { className: "bg-black/30 rounded-lg p-2 text-center border border-white/5", children: [_jsx("div", { className: "text-[10px] text-gray-400 mb-1", children: "độ đáng ngờ" }), _jsxs("div", { className: `text-sm font-semibold ${userData.suspicion > 50 ? 'text-red-400' : 'text-green-400'}`, children: [userData.suspicion, "%"] })] }), _jsxs("div", { className: "bg-black/30 rounded-lg p-2 text-center border border-white/5", children: [_jsx("div", { className: "text-[10px] text-gray-400 mb-1", children: "tiền (yên)" }), _jsxs("div", { className: "text-sm font-semibold text-yellow-400", children: ["¥", userData.money.toLocaleString()] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between gap-2", children: [_jsxs("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1", children: [_jsx(ShoppingCart, { size: 10 }), " tiếp tế nhanh"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-[10px] text-gray-500 uppercase tracking-wider", children: "số lượng" }), _jsx("input", { type: "number", inputMode: "numeric", min: 1, step: 1, value: quickSupplyQtyInput, onChange: e => setQuickSupplyQtyInput(e.target.value), onBlur: () => setQuickSupplyQtyInput(String(quickSupplyQty)), "aria-label": "số lượng tiếp tế nhanh", className: "w-16 bg-black/30 border border-white/10 rounded-md px-2 py-1 text-[10px] text-gray-200 focus:outline-none focus:border-pink-500" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { onClick: () => void purchaseEnergy(quickSupplyQty), disabled: Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)) <= 0 ||
                                                        userData.money <
                                                            Math.min(Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)), quickSupplyQty) * 100, className: "flex flex-col items-start bg-blue-900/20 border border-blue-500/20 hover:bg-blue-900/30 p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsxs("div", { className: "flex justify-between w-full mb-1", children: [_jsx(Zap, { size: 16, className: "text-blue-400" }), _jsx("span", { className: "text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded", children: Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)) <= 0
                                                                        ? 'đã đầy'
                                                                        : `¥${(Math.min(Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)), quickSupplyQty) * 100).toLocaleString()}` })] }), _jsx("div", { className: "text-xs font-bold text-gray-200", children: Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)) <= 0
                                                                ? 'năng lượng đã đầy'
                                                                : `hồi ${Math.min(Math.max(0, userData.mcEnergyMax - Math.floor(userData.mcEnergy)), quickSupplyQty)} năng lượng` })] }), _jsxs("button", { onClick: () => void purchaseMaxEnergy(quickSupplyQty), disabled: userData.mcPoints < quickSupplyQty, className: "flex flex-col items-start bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/30 p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsxs("div", { className: "flex justify-between w-full mb-1", children: [_jsx(Battery, { size: 16, className: "text-purple-400" }), _jsxs("span", { className: "text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded", children: [quickSupplyQty, " PT"] })] }), _jsxs("div", { className: "text-xs font-bold text-gray-200", children: ["giới hạn +", quickSupplyQty] })] })] }), _jsxs("button", { onClick: () => void purchasePoints(quickSupplyQty), disabled: userData.money < quickSupplyQty * 1000, className: "w-full flex justify-between items-center bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5 transition-colors active:scale-[0.98]", children: [_jsxs("span", { className: "text-xs text-gray-300 flex items-center gap-2", children: [_jsx(RefreshCcw, { size: 12 }), " nạp ", quickSupplyQty, " điểm MC"] }), _jsxs("span", { className: "text-xs font-bold text-yellow-400", children: ["¥", (quickSupplyQty * 1000).toLocaleString()] })] })] }), _jsxs("div", { className: "mt-4 space-y-2", children: [_jsxs("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1", children: [_jsx(Lock, { size: 10 }), " trung tâm đăng ký (mỗi tuần)"] }), _jsxs("div", { className: "p-3 rounded-xl border border-white/10 bg-black/20", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-xs text-gray-300", children: "đăng ký hiện tại" }), _jsx("div", { className: "text-xs font-bold text-gray-100", children: remainingSubscriptionText })] }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("button", { onClick: () => void toggleAutoRenew(), disabled: !subscription || debugEnabled, className: "text-[10px] px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-300 disabled:opacity-40", children: ["tự động gia hạn: ", subscription?.autoRenew ? 'bật' : 'tắt'] }), subscription &&
                                                            !debugEnabled &&
                                                            nowVirtualMinutes !== null &&
                                                            subscription.endVirtualMinutes <= nowVirtualMinutes && (_jsx("button", { onClick: () => void subscribeTier(subscription.tier), className: "text-[10px] px-3 py-1 rounded-lg bg-amber-500 text-black font-bold", children: "gia hạn" }))] }), subscriptionNotice && _jsx("div", { className: "mt-2 text-[10px] text-pink-300", children: subscriptionNotice })] }), _jsx("div", { className: "grid grid-cols-1 gap-2", children: ['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'].map(tier => {
                                                const price = SUBSCRIPTION_PRICES[tier];
                                                const lockedByUnlock = !canSubscribeTier(tier);
                                                const isCurrent = subscription?.tier === tier;
                                                const activeNow = subscriptionActive && Boolean(subscription);
                                                const label = !subscription || !activeNow
                                                    ? 'đăng ký'
                                                    : isCurrent
                                                        ? 'gia hạn'
                                                        : subscriptionTiers.indexOf(tier) > subscriptionTiers.indexOf(subscription.tier)
                                                            ? 'nâng cấp'
                                                            : 'đăng ký';
                                                return (_jsxs("button", { onClick: () => void subscribeTier(tier), disabled: debugEnabled || lockedByUnlock || userData.money < price, className: "w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: [_jsxs("div", { className: "flex flex-col items-start", children: [_jsx("div", { className: "text-xs font-bold text-gray-100", children: tier }), _jsx("div", { className: "text-[10px] text-gray-400", children: lockedByUnlock
                                                                        ? `cần tổng tiêu hao ${DataService.getSubscriptionUnlockThreshold(tier)}`
                                                                        : `${label} ¥${price.toLocaleString()}/tuần` })] }), _jsx("div", { className: "text-[10px] font-bold text-yellow-300", children: lockedByUnlock ? 'chưa mở khóa' : label })] }, tier));
                                            }) })] })] }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 no-scrollbar", children: VIP_LEVELS.map(tier => renderTierSection(tier)) }), _jsxs("div", { ref: footerControlsRef, className: "bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 pb-8 rounded-t-2xl shadow-[0_-5px_30px_rgba(0,0,0,0.6)] animate-slide-up shrink-0", children: [_jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", placeholder: "có thể nhập người bạn muốn thôi miên, cách thôi miên hoặc ghi chú khác", value: globalNote, onChange: e => setGlobalNote(e.target.value), className: "w-full bg-black/40 border-b border-white/20 px-2 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors" }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-white/5", children: [_jsx(Clock, { size: 16, className: "text-pink-400 mr-2" }), _jsx("input", { type: "number", inputMode: "numeric", min: 1, step: 1, value: durationInput, onChange: e => setDurationInput(e.target.value), onBlur: () => setDurationInput(String(duration)), className: "w-12 bg-transparent text-white font-bold text-center focus:outline-none" }), _jsx("span", { className: "text-xs text-gray-400 ml-1", children: "phút" })] }), _jsxs("button", { onClick: handleStart, disabled: !hasSessionFeaturesEnabled, className: `
                 flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                 ${hasSessionFeaturesEnabled
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-pink-500/25 active:scale-95'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
               `, children: [_jsx(Zap, { size: 18, fill: "currentColor" }), missingEnergy > 0 ? 'không đủ năng lượng' : missingPoints > 0 ? 'không đủ điểm' : 'khởi động thôi miên'] })] }), _jsxs("div", { className: "flex justify-between mt-2 px-1 text-[10px] text-gray-500", children: [_jsxs("span", { children: ["dự kiến tiêu hao:", ' ', _jsx("span", { className: missingEnergy > 0 ? 'text-red-500 font-bold' : 'text-gray-300', children: totalEnergyCost }), " MC", totalPointsCost > 0 && (_jsxs(_Fragment, { children: [' ', "+", ' ', _jsx("span", { className: missingPoints > 0 ? 'text-red-500 font-bold' : 'text-gray-300', children: totalPointsCost }), ' ', "PT"] }))] }), _jsxs("span", { children: ["hiện có thể dùng: ", Math.floor(userData.mcEnergy), " MC", totalPointsCost > 0 ? `, ${userData.mcPoints} PT` : ''] })] })] }), showLowEnergyModal && (_jsx("div", { className: "absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in", children: _jsx("div", { className: "bg-gray-900 border border-red-500/30 w-full max-w-xs rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-slide-up", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx(AlertTriangle, { size: 48, className: "text-red-500 mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "không đủ tài nguyên" }), _jsxs("p", { className: "text-sm text-gray-400 mb-6", children: ["khởi động cần ", _jsx("span", { className: "text-white font-bold", children: totalEnergyCost }), " MC", totalPointsCost > 0 ? ` + ${totalPointsCost} PT` : '', ", hiện bạn còn thiếu", ' ', missingEnergy > 0 && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-red-400 font-bold", children: missingEnergy }), " năng lượng"] })), missingEnergy > 0 && missingPoints > 0 ? ' và ' : '', missingPoints > 0 && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-red-400 font-bold", children: missingPoints }), " điểm"] })), "."] }), _jsxs("div", { className: "w-full space-y-2", children: [_jsxs("button", { onClick: () => void (async () => {
                                            const topUpCost = missingEnergy * 100 + missingPoints * 1000;
                                            if (userData.money < topUpCost)
                                                return;
                                            const nextMoney = userData.money - topUpCost;
                                            const nextEnergy = Math.min(userData.mcEnergyMax, userData.mcEnergy + missingEnergy);
                                            const nextPoints = userData.mcPoints + missingPoints;
                                            try {
                                                const persisted = await DataService.updateResources({
                                                    money: nextMoney,
                                                    mcEnergy: nextEnergy,
                                                    mcPoints: nextPoints,
                                                });
                                                onUpdateUser(persisted);
                                            }
                                            catch (err) {
                                                console.warn('[HypnoOS] lưu bù đủ tài nguyên thất bại', err);
                                                onUpdateUser({
                                                    ...userData,
                                                    money: nextMoney,
                                                    mcEnergy: nextEnergy,
                                                    mcPoints: nextPoints,
                                                });
                                            }
                                            void MvuBridge.appendThisTurnAppOperationLog(`bù đủ tài nguyên (-¥${topUpCost.toLocaleString()}, +${missingEnergy} MC, +${missingPoints} PT)`);
                                            setShowLowEnergyModal(false);
                                        })(), disabled: userData.money < missingEnergy * 100 + missingPoints * 1000, className: "w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed", children: ["tiêu ¥", missingEnergy * 100 + missingPoints * 1000, " bù đủ"] }), _jsx("button", { onClick: () => setShowLowEnergyModal(false), className: "w-full py-3 text-gray-400 text-sm hover:text-white", children: "hủy" })] })] }) }) }))] }));
};
