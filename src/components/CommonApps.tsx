import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeft, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Construction, Lock, Package, Search, User, } from 'lucide-react';
import { DataService } from '../services/dataService';
import { MvuBridge, waitForMvuReady } from '../services/mvuBridge';
// Wrapper for standard pages
const PageLayout = ({ title, children, onBack, color = 'bg-gray-100' }) => (_jsxs("div", { className: `h-full flex flex-col ${color} overflow-hidden animate-fade-in`, children: [_jsxs("div", { className: "px-4 py-4 flex items-center gap-3 bg-white/50 backdrop-blur-md shadow-sm z-10", children: [_jsx("button", { onClick: onBack, className: "p-1 rounded-full hover:bg-black/5", children: _jsx(ArrowLeft, { className: "text-gray-800" }) }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: title })] }), _jsx("div", { className: "flex-1 overflow-auto p-4", children: children })] }));
export const BodyStatsApp = ({ onBack }) => _jsx(BodyScanApp, { onBack: onBack });
function displayText(value) {
    return String(value ?? '').replace(/_/g, ' ');
}
function extractScalar(value) {
    if (value === null || value === undefined)
        return '—';
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean')
        return String(value);
    if (Array.isArray(value))
        return value.map(extractScalar).join(', ');
    if (typeof value === 'object') {
        const record = value;
        const scalarCandidates = [record.value, record.current, record.amount, record.mô_tả, record.description];
        for (const candidate of scalarCandidates) {
            if (typeof candidate === 'number' || typeof candidate === 'string' || typeof candidate === 'boolean')
                return String(candidate);
        }
        try {
            return JSON.stringify(record);
        }
        catch {
            return '[object]';
        }
    }
    return String(value);
}
function isScalarValue(value) {
    return value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value);
}
function clampPercent(value) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n))
        return null;
    return Math.max(0, Math.min(100, n));
}
const STAT_ORDER = [
    'độ_cảnh_giác',
    'độ_phục_tùng',
    'độ_thiện_cảm',
    'dục_vọng',
    'điểm_khoái_cảm',
    'độ_nhạy_âm_vật',
    'độ_nhạy_âm_đạo',
    'độ_nhạy_hậu_môn',
    'độ_nhạy_niệu_đạo',
    'độ_nhạy_núm_vú',
    'số_lần_cực_khoái_âm_vật',
    'số_lần_cực_khoái_âm_đạo',
    'số_lần_cực_khoái_hậu_môn',
    'số_lần_cực_khoái_niệu_đạo',
    'số_lần_cực_khoái_núm_vú',
];
const BAR_STATS = new Set(['độ_cảnh_giác', 'độ_phục_tùng', 'độ_thiện_cảm', 'dục_vọng', 'điểm_khoái_cảm']);
const BodyScanApp = ({ onBack }) => {
    const [vipUnlocked, setVipUnlocked] = useState(false);
    const [roles, setRoles] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refreshRef = useRef(() => { });
    const selectorRef = useRef(null);
    const roleNames = useMemo(() => Object.keys(roles)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'vi-VN')), [roles]);
    const filteredRoleNames = useMemo(() => {
        const q = search.trim();
        if (!q)
            return roleNames;
        const needle = displayText(q).toLocaleLowerCase('vi-VN');
        return roleNames.filter(name => displayText(name).toLocaleLowerCase('vi-VN').includes(needle) || name.toLocaleLowerCase('vi-VN').includes(needle));
    }, [roleNames, search]);
    const roleData = useMemo(() => {
        if (!selectedRole)
            return null;
        return roles[selectedRole] ?? null;
    }, [roles, selectedRole]);
    const orderedStatEntries = useMemo(() => {
        if (!roleData || typeof roleData !== 'object')
            return [];
        const record = roleData;
        const seen = new Set();
        const entries = [];
        for (const k of STAT_ORDER) {
            if (Object.prototype.hasOwnProperty.call(record, k)) {
                entries.push([k, record[k]]);
                seen.add(k);
            }
        }
        for (const [k, v] of Object.entries(record)) {
            if (seen.has(k))
                continue;
            if (k.startsWith('_'))
                continue;
            entries.push([k, v]);
        }
        return entries;
    }, [roleData]);
    const nonBarEntries = useMemo(() => orderedStatEntries.filter(([k]) => !BAR_STATS.has(k)), [orderedStatEntries]);
    const sensitivityEntries = useMemo(() => nonBarEntries.filter(([k, v]) => k.includes('độ_nhạy') && isScalarValue(v)), [nonBarEntries]);
    const orgasmCountEntries = useMemo(() => nonBarEntries.filter(([k, v]) => k.includes('số_lần_cực_khoái') && isScalarValue(v)), [nonBarEntries]);
    const otherScalarEntries = useMemo(() => nonBarEntries.filter(([k, v]) => isScalarValue(v) && !k.includes('độ_nhạy') && !k.includes('số_lần_cực_khoái')), [nonBarEntries]);
    const complexEntries = useMemo(() => nonBarEntries.filter(([, v]) => !isScalarValue(v)), [nonBarEntries]);
    const refresh = async () => {
        setError(null);
        setLoading(true);
        try {
            const rolesData = await MvuBridge.getRoles();
            if (!rolesData) {
                setRoles({});
                setSelectedRole(null);
                setError('chưa kết nối biến Tavern (MVU chưa khởi tạo hoặc không ở trong môi trường Tavern)');
                return;
            }
            setRoles(rolesData);
            const nextNames = Object.keys(rolesData)
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'vi-VN'));
            setSelectedRole(prev => {
                if (prev && nextNames.includes(prev))
                    return prev;
                return nextNames[0] ?? null;
            });
        }
        catch (err) {
            console.warn('[HypnoOS] đọc kiểm tra cơ thể thất bại', err);
            setError('đọc thất bại: vui lòng thử lại sau');
        }
        finally {
            setLoading(false);
        }
    };
    refreshRef.current = refresh;
    useEffect(() => {
        let stopped = false;
        void (async () => {
            try {
                const unlocks = await DataService.getUnlocks();
                if (stopped)
                    return;
                setVipUnlocked(unlocks.bodyStatsUnlocked);
            }
            catch (err) {
                console.warn('[HypnoOS] đọc trạng thái mở khóa chức năng thất bại', err);
            }
        })();
        return () => {
            stopped = true;
        };
    }, []);
    useEffect(() => {
        if (!selectorOpen)
            return;
        const onMouseDown = (event) => {
            const target = event.target;
            if (!(target instanceof Node))
                return;
            if (selectorRef.current && !selectorRef.current.contains(target)) {
                setSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [selectorOpen]);
    useEffect(() => {
        void refresh();
    }, []);
    useEffect(() => {
        let stops = [];
        void (async () => {
            try {
                const ready = await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
                if (!ready)
                    return;
                stops = [
                    eventOn(Mvu.events.VARIABLE_INITIALIZED, () => refreshRef.current()),
                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => refreshRef.current()),
                ];
            }
            catch {
                // ignore: not in tavern env
            }
        })();
        return () => {
            stops.forEach(s => s.stop());
        };
    }, []);
    return (_jsxs("div", { className: "h-full relative flex flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-black text-white overflow-hidden animate-fade-in", children: [_jsxs("div", { className: "px-4 pt-6 pb-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-white/10 transition-colors", children: _jsx(ArrowLeft, { size: 18, className: "text-white/80" }) }), _jsx("div", { className: "min-w-0", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { size: 16, className: "text-cyan-300" }), _jsx("h1", { className: "text-sm font-bold tracking-wide", children: "kiểm tra cơ thể" }), !vipUnlocked && (_jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70 flex items-center gap-1", children: [_jsx(Lock, { size: 10 }), " bị giới hạn"] }))] }) })] }), _jsxs("div", { ref: selectorRef, className: "relative shrink-0", children: [_jsxs("button", { onClick: () => {
                                    setSearch('');
                                    setSelectorOpen(v => !v);
                                }, className: "px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/85 flex items-center gap-2 transition-colors", children: [_jsx(User, { size: 14, className: "text-white/60" }), _jsx("span", { className: "max-w-[120px] truncate", children: selectedRole ? displayText(selectedRole) : 'chọn mục tiêu' }), _jsx(ChevronDown, { size: 14, className: "text-white/30" })] }), selectorOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-[260px] max-w-[80vw] z-50 rounded-2xl border border-white/10 bg-slate-950 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden", children: [_jsx("div", { className: "p-3 border-b border-white/10 bg-black/20", children: _jsxs("div", { className: "flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2", children: [_jsx(Search, { size: 14, className: "text-white/40" }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "tìm nhân vật...", className: "w-full bg-transparent text-xs text-white/80 placeholder:text-white/30 focus:outline-none" })] }) }), _jsx("div", { className: "max-h-[45vh] overflow-y-auto no-scrollbar p-2 space-y-1", children: filteredRoleNames.length === 0 ? (_jsx("div", { className: "py-6 text-center text-xs text-white/40", children: "không tìm thấy nhân vật phù hợp" })) : (filteredRoleNames.map(name => {
                                            const active = name === selectedRole;
                                            return (_jsxs("button", { onClick: () => {
                                                    setSelectedRole(name);
                                                    setSelectorOpen(false);
                                                }, className: [
                                                    'w-full text-left px-3 py-2 rounded-xl border transition-colors flex items-center justify-between gap-3',
                                                    active
                                                        ? 'bg-white/10 border-cyan-400/30'
                                                        : 'bg-white/0 border-white/5 hover:bg-white/5 hover:border-white/10',
                                                ].join(' '), children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-sm font-semibold text-white/90 truncate", children: displayText(name) }), _jsx("div", { className: "text-[10px] text-white/40 truncate", children: roles[name] && typeof roles[name] === 'object'
                                                                    ? `${Object.keys(roles[name]).filter(k => !k.startsWith('_')).length} mục`
                                                                    : '—' })] }), _jsx("div", { className: [
                                                            'w-9 h-9 rounded-2xl flex items-center justify-center',
                                                            active ? 'bg-cyan-500/20' : 'bg-white/5',
                                                        ].join(' '), children: _jsx(User, { size: 18, className: active ? 'text-cyan-300' : 'text-white/40' }) })] }, name));
                                        })) })] }))] })] }), error && (_jsx("div", { className: "px-4 py-3 border-b border-white/5 bg-black/30", children: _jsxs("div", { className: "flex items-start gap-2 text-[11px] text-amber-200/90", children: [_jsx(AlertTriangle, { size: 14, className: "mt-0.5 text-amber-300" }), _jsx("div", { className: "leading-snug", children: error })] }) })), _jsx("div", { className: "flex-1 overflow-y-auto no-scrollbar p-4 space-y-4", children: loading ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse" }), _jsx("div", { className: "h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse" }), _jsx("div", { className: "h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse" })] })) : roleNames.length === 0 ? (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-white/50 text-sm", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3", children: _jsx(Activity, { className: "text-cyan-300" }) }), "chưa có dữ liệu nhân vật"] })) : !selectedRole ? (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-white/50 text-sm", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3", children: _jsx(User, { className: "text-white/60" }) }), "hãy chọn mục tiêu kiểm tra"] })) : !roleData ? (_jsx("div", { className: "h-full flex flex-col items-center justify-center text-white/50 text-sm", children: "chưa có dữ liệu của nhân vật này" })) : !vipUnlocked ? (_jsx("div", { className: "p-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-black/30", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center", children: _jsx(Lock, { size: 18, className: "text-white/60" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-bold", children: "mô-đun kiểm tra chưa được cấp quyền" }), _jsx("div", { className: "text-xs text-white/60 mt-1 leading-relaxed", children: "Mô-đun này thuộc VIP1 'hiển thị trạng thái nhân vật'. Sau khi mở khóa có thể xem độ cảnh giác, độ phục tùng, dục vọng, điểm khoái cảm và các dữ liệu định lượng chi tiết." })] })] }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-4 rounded-2xl border border-white/10 bg-white/5", children: [_jsx("div", { className: "text-xs text-white/50 mb-2", children: "mục tiêu" }), _jsx("div", { className: "text-base font-bold truncate", children: displayText(selectedRole) })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: orderedStatEntries
                                .filter(([k]) => BAR_STATS.has(k))
                                .map(([k, v]) => (_jsx(StatRow, { label: k, value: v }, k))) }), sensitivityEntries.length > 0 && _jsx(StatGroupCard, { title: "độ nhạy", entries: sensitivityEntries }), orgasmCountEntries.length > 0 && _jsx(StatGroupCard, { title: "số lần cực khoái", entries: orgasmCountEntries }), otherScalarEntries.length > 0 && _jsx(StatGroupCard, { title: "số trị khác", entries: otherScalarEntries }), complexEntries.length > 0 && (_jsx("div", { className: "space-y-2", children: complexEntries.map(([k, v]) => (_jsx(KeyValueRow, { k: k, v: v }, k))) }))] })) })] }));
};
const StatGroupCard = ({ title, entries }) => (_jsxs("div", { className: "p-4 rounded-2xl border border-white/10 bg-white/5", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("div", { className: "text-xs font-bold text-white/80", children: title }), _jsx("div", { className: "text-[10px] text-white/40", children: entries.length })] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: entries.map(([k, v]) => (_jsx(MiniStat, { label: k, value: v }, k))) })] }));
const MiniStat = ({ label, value }) => (_jsxs("div", { className: "px-3 py-2 rounded-xl border border-white/10 bg-black/20", children: [_jsx("div", { className: "text-[10px] text-white/55 truncate", children: displayText(label) }), _jsx("div", { className: "mt-0.5 text-sm font-bold text-white/90 tabular-nums truncate", children: displayText(extractScalar(value)) })] }));
const StatRow = ({ label, value }) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    const percent = clampPercent(Number.isFinite(numeric) ? numeric : 0) ?? 0;
    const color = label === 'độ_cảnh_giác'
        ? 'from-red-500 to-amber-400'
        : label === 'độ_phục_tùng'
            ? 'from-emerald-400 to-cyan-400'
            : label === 'độ_thiện_cảm'
                ? 'from-pink-400 to-rose-400'
                : label === 'dục_vọng'
                    ? 'from-fuchsia-400 to-cyan-400'
                    : 'from-cyan-400 to-violet-400';
    return (_jsxs("div", { className: "p-3 rounded-xl border border-white/10 bg-black/20", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "text-xs font-semibold text-white/80", children: displayText(label) }), _jsx("div", { className: "text-xs font-bold text-white/90 tabular-nums", children: Number.isFinite(numeric) ? numeric : displayText(extractScalar(value)) })] }), _jsx("div", { className: "h-2 bg-white/10 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full bg-gradient-to-r ${color}`, style: { width: `${percent}%` } }) })] }));
};
const KeyValueRow = ({ k, v }) => {
    const [open, setOpen] = useState(false);
    const isExpandable = v !== null && typeof v === 'object';
    if (!isExpandable) {
        return (_jsxs("div", { className: "flex items-start justify-between gap-3 p-3 rounded-xl border border-white/10 bg-black/20", children: [_jsx("div", { className: "text-[11px] text-white/70 font-semibold min-w-[80px]", children: displayText(k) }), _jsx("div", { className: "text-[11px] text-white/85 text-right break-words", children: displayText(extractScalar(v)) })] }));
    }
    let preview = '[object]';
    if (Array.isArray(v))
        preview = `Array(${v.length})`;
    else
        preview = `Object(${Object.keys(v).length})`;
    return (_jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 overflow-hidden", children: [_jsxs("button", { onClick: () => setOpen(o => !o), className: "w-full flex items-center justify-between gap-3 p-3 hover:bg-white/5 transition-colors", children: [_jsx("div", { className: "text-[11px] text-white/70 font-semibold", children: displayText(k) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-[10px] text-white/40", children: preview }), open ? (_jsx(ChevronUp, { size: 14, className: "text-white/30" })) : (_jsx(ChevronDown, { size: 14, className: "text-white/30" }))] })] }), open && (_jsx("pre", { className: "text-[10px] leading-relaxed text-white/80 p-3 border-t border-white/10 bg-black/30 overflow-x-auto", children: displayText(safeJson(v)) }))] }));
};
function safeJson(value) {
    try {
        return JSON.stringify(value, null, 2);
    }
    catch {
        return String(value);
    }
}
export const CalendarApp = ({ onBack }) => _jsx(CalendarDarkApp, { onBack: onBack });
const SCHOOL_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const MONTH_LENGTHS = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
};
function inferEventKind(title) {
    if (title.includes('ngày nghỉ') || title.includes('nghỉ bù'))
        return 'holiday';
    const festivals = [
        'Thất Tịch',
        'Halloween',
        'Tết Dương lịch',
        'Giáng sinh',
        'đêm Giáng sinh',
        'đêm giao thừa',
        'lễ Obon',
        'Valentine',
        'Valentine trắng',
        'lễ Hina',
        'Setsubun',
        'lễ Shichi-Go-San',
        'Cá tháng Tư',
    ];
    if (festivals.some(key => title.includes(key)))
        return 'festival';
    return 'event';
}
function ev(start, end, title) {
    return { start, end, title, kind: inferEventKind(title) };
}
const CALENDAR_EVENTS = {
    4: [
        ev(1, 1, 'Cá tháng Tư'),
        ev(8, 8, 'lễ nhập học/lễ khai giảng'),
        ev(10, 14, 'tuần tuyển thành viên câu lạc bộ'),
        ev(15, 15, 'buổi giới thiệu câu lạc bộ'),
        ev(20, 20, 'khám sức khỏe'),
        ev(29, 29, 'bắt đầu kỳ nghỉ Tuần lễ Vàng'),
    ],
    5: [ev(6, 6, 'kết thúc kỳ nghỉ Tuần lễ Vàng'), ev(20, 23, 'thi giữa kỳ học kỳ 1'), ev(25, 25, 'đại hội bóng')],
    6: [ev(1, 1, 'đổi đồng phục (sang đồ hè)'), ev(10, 10, 'kiểm tra thể lực toàn trường'), ev(25, 25, 'bầu cử hội học sinh'), ev(30, 30, 'đêm thử gan')],
    7: [
        ev(7, 7, 'Thất Tịch'),
        ev(14, 17, 'thi cuối kỳ học kỳ 1'),
        ev(21, 21, 'ngày của biển (thứ Hai tuần 3 tháng 7/ngày nghỉ)'),
        ev(22, 22, 'lễ bế giảng học kỳ 1'),
        ev(23, 23, 'bắt đầu nghỉ hè'),
        ev(25, 28, 'trại hè câu lạc bộ'),
    ],
    8: [
        ev(1, 1, 'ngày toàn trường trở lại'),
        ev(11, 11, 'ngày của núi (ngày nghỉ)'),
        ev(13, 16, 'lễ Obon'),
        ev(16, 17, 'Summer Comi(hội doujin/Tokyo Big Sight)'),
        ev(25, 25, 'phụ đạo/nước rút bài tập'),
        ev(31, 31, 'ngày cuối kỳ nghỉ hè'),
    ],
    9: [
        ev(1, 1, 'lễ khai giảng học kỳ 2'),
        ev(15, 15, 'ngày kính lão (thứ Hai tuần 3 tháng 9/ngày nghỉ)'),
        ev(16, 16, 'thành lập ban tổ chức lễ hội trường / quyết định hạng mục trưng bày của lớp'),
        ev(23, 23, 'ngày thu phân (ngày nghỉ)'),
        ev(29, 29, 'lễ hội thể thao (đại hội thể thao)'),
    ],
    10: [
        ev(1, 1, 'đổi đồng phục (sang đồ đông)'),
        ev(13, 13, 'ngày thể thao (thứ Hai tuần 2 tháng 10/ngày nghỉ)'),
        ev(21, 24, 'thi giữa kỳ học kỳ 2'),
        ev(31, 31, 'tiệc cosplay sau giờ học Halloween'),
    ],
    11: [
        ev(1, 2, 'lễ hội văn hóa (lễ hội trường)'),
        ev(3, 3, 'ngày văn hóa (ngày nghỉ/đêm hậu lễ hội văn hóa)'),
        ev(15, 15, 'lễ Shichi-Go-San'),
        ev(23, 23, 'ngày tạ ơn lao động (ngày nghỉ)'),
        ev(24, 24, 'nghỉ bù'),
        ev(25, 28, 'chuyến du lịch học tập'),
    ],
    12: [
        ev(9, 12, 'thi cuối kỳ học kỳ 2'),
        ev(24, 24, 'lễ bế giảng học kỳ 2/đêm Giáng sinh'),
        ev(25, 25, 'Giáng sinh/bắt đầu nghỉ đông'),
        ev(30, 31, 'Winter Comi(hội doujin)'),
        ev(31, 31, 'đêm giao thừa'),
    ],
    1: [
        ev(1, 1, 'Tết Dương lịch (ngày nghỉ)'),
        ev(7, 7, 'lễ khai giảng học kỳ 3'),
        ev(13, 13, 'ngày thành nhân (thứ Hai tuần 2 tháng 1/ngày nghỉ)'),
        ev(17, 18, 'kỳ thi chung tuyển sinh đại học (năm ba/giữ yên lặng trong trường)'),
        ev(25, 25, 'đại hội marathon/chạy bền'),
    ],
    2: [
        ev(3, 3, 'Setsubun (ném đậu xua tà)'),
        ev(11, 11, 'ngày kỷ niệm lập quốc (ngày nghỉ)'),
        ev(14, 14, 'Valentine'),
        ev(23, 23, 'sinh nhật Thiên hoàng (ngày nghỉ)'),
        ev(24, 24, 'nghỉ bù'),
        ev(25, 27, 'thi cuối năm học (năm nhất và năm hai)'),
    ],
    3: [
        ev(3, 3, 'lễ Hina'),
        ev(14, 14, 'Valentine trắng'),
        ev(20, 20, 'ngày xuân phân (ngày nghỉ)'),
        ev(24, 24, 'lễ kết thúc năm học'),
        ev(25, 25, 'bắt đầu nghỉ xuân'),
    ],
};
function eventsForDay(month, day) {
    const list = CALENDAR_EVENTS[month] ?? [];
    return list.filter(e => day >= e.start && day <= e.end);
}
function formatEventTitleForCell(e) {
    const main = e.title.split('(')[0].split('/')[0].trim();
    return main.length > 6 ? main.slice(0, 6) + '…' : main;
}
function parseSystemDate(raw) {
    if (typeof raw !== 'string')
        return null;
    const monthMatch = /tháng\s*(\d{1,2})/i.exec(raw);
    const dayMatch = /ngày\s*(\d{1,2})/i.exec(raw);
    if (!monthMatch || !dayMatch)
        return null;
    const month = Number(monthMatch[1]);
    const day = Number(dayMatch[1]);
    if (!Number.isFinite(month) || !Number.isFinite(day))
        return null;
    const weekMatch = /(chủ nhật|thứ\s*(hai|ba|tư|tu|năm|nam|sáu|sau|bảy|bay))/i.exec(raw);
    const weekdayLabel = weekMatch ? weekMatch[0] : null;
    const weekdayIndex = (() => {
        if (!weekMatch)
            return null;
        const normalized = weekMatch[0].toLowerCase();
        if (normalized.includes('chủ')) return 0;
        if (normalized.includes('hai')) return 1;
        if (normalized.includes('ba')) return 2;
        if (normalized.includes('tư') || normalized.includes('tu')) return 3;
        if (normalized.includes('năm') || normalized.includes('nam')) return 4;
        if (normalized.includes('sáu') || normalized.includes('sau')) return 5;
        if (normalized.includes('bảy') || normalized.includes('bay')) return 6;
        return null;
    })();
    return { month, day, weekdayIndex, weekdayLabel };
}
function offsetFromApril1(month, day) {
    const idx = SCHOOL_MONTHS.indexOf(month);
    if (idx < 0)
        return 0;
    let sum = 0;
    for (let i = 0; i < idx; i++)
        sum += MONTH_LENGTHS[SCHOOL_MONTHS[i]];
    sum += Math.max(0, day - 1);
    return sum;
}
function monthStartOffset(month) {
    const idx = SCHOOL_MONTHS.indexOf(month);
    if (idx < 0)
        return 0;
    let sum = 0;
    for (let i = 0; i < idx; i++)
        sum += MONTH_LENGTHS[SCHOOL_MONTHS[i]];
    return sum;
}
function weekdayLabelFromIndex(idx) {
    const map = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return map[idx] ?? '·';
}
const CalendarDarkApp = ({ onBack }) => {
    const [system, setSystem] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [displayedMonth, setDisplayedMonth] = useState(4);
    const [displayedYearOffset, setDisplayedYearOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState(1);
    const didInitRef = useRef(false);
    const loadSystem = async () => {
        const sys = await MvuBridge.getSystem();
        setSystem(sys);
        setCurrentDate(parseSystemDate(sys?.ngày_hiện_tại));
    };
    useEffect(() => {
        void loadSystem();
    }, []);
    useEffect(() => {
        let stops = [];
        void (async () => {
            try {
                const ready = await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
                if (!ready)
                    return;
                stops = [
                    eventOn(Mvu.events.VARIABLE_INITIALIZED, () => void loadSystem()),
                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => void loadSystem()),
                ];
            }
            catch {
                // ignore
            }
        })();
        return () => stops.forEach(s => s.stop());
    }, []);
    useEffect(() => {
        if (!currentDate || didInitRef.current)
            return;
        didInitRef.current = true;
        setDisplayedMonth(currentDate.month);
        setDisplayedYearOffset(0);
        setSelectedDay(currentDate.day);
    }, [currentDate]);
    const april1Weekday = useMemo(() => {
        if (!currentDate || currentDate.weekdayIndex === null)
            return 0;
        const off = offsetFromApril1(currentDate.month, currentDate.day) % 7;
        return (currentDate.weekdayIndex - off + 7) % 7;
    }, [currentDate]);
    const startWeekday = useMemo(() => {
        const yearShift = ((displayedYearOffset % 7) + 7) % 7; // 365 % 7 = 1
        return (april1Weekday + yearShift + (monthStartOffset(displayedMonth) % 7)) % 7;
    }, [april1Weekday, displayedMonth, displayedYearOffset]);
    const daysInMonth = MONTH_LENGTHS[displayedMonth] ?? 30;
    const gridCells = useMemo(() => {
        const cells = [];
        for (let i = 0; i < startWeekday; i++)
            cells.push(null);
        for (let d = 1; d <= daysInMonth; d++)
            cells.push(d);
        while (cells.length % 7 !== 0)
            cells.push(null);
        while (cells.length < 42)
            cells.push(null);
        return cells;
    }, [startWeekday, daysInMonth]);
    const monthIdx = useMemo(() => SCHOOL_MONTHS.indexOf(displayedMonth), [displayedMonth]);
    const canSwitch = monthIdx >= 0;
    const goMonth = (delta) => {
        if (!canSwitch)
            return;
        const yearDelta = delta === 1 && monthIdx === SCHOOL_MONTHS.length - 1 ? 1 : delta === -1 && monthIdx === 0 ? -1 : 0;
        const nextYearOffset = displayedYearOffset + yearDelta;
        const nextIdx = (monthIdx + delta + SCHOOL_MONTHS.length) % SCHOOL_MONTHS.length;
        const nextMonth = SCHOOL_MONTHS[nextIdx];
        setDisplayedYearOffset(nextYearOffset);
        setDisplayedMonth(nextMonth);
        if (currentDate && currentDate.month === nextMonth && nextYearOffset === 0) {
            setSelectedDay(currentDate.day);
        }
        else {
            setSelectedDay(1);
        }
    };
    const todayDay = currentDate?.day ?? null;
    const todayMonth = currentDate?.month ?? null;
    const todayWeek = currentDate?.weekdayLabel ??
        (currentDate?.weekdayIndex !== null && currentDate?.weekdayIndex !== undefined
            ? weekdayLabelFromIndex(currentDate.weekdayIndex)
            : null);
    const schedule = typeof system?.lịch_trình_hiện_tại === 'string' ? system.lịch_trình_hiện_tại : null;
    const selectedEvents = useMemo(() => {
        if (!selectedDay)
            return [];
        return eventsForDay(displayedMonth, selectedDay);
    }, [displayedMonth, selectedDay]);
    return (_jsxs("div", { className: "h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-black text-white overflow-hidden animate-fade-in", children: [_jsxs("div", { className: "px-4 pt-6 pb-4 border-b border-white/10 bg-black/20 backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-white/10 transition-colors", children: _jsx(ArrowLeft, { size: 18, className: "text-white/80" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => goMonth(-1), className: "p-2 rounded-full hover:bg-white/10 transition-colors", "aria-label": "tháng trước", children: _jsx(ChevronLeft, { size: 18, className: "text-white/70" }) }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5", children: [_jsx(CalendarIcon, { size: 16, className: "text-cyan-300" }), _jsxs("div", { className: "text-sm font-bold tracking-wide", children: ["tháng ", displayedMonth] })] }), _jsx("button", { onClick: () => goMonth(1), className: "p-2 rounded-full hover:bg-white/10 transition-colors", "aria-label": "tháng sau", children: _jsx(ChevronRight, { size: 18, className: "text-white/70" }) })] }), _jsx("div", { className: "w-9" })] }), displayedYearOffset === 0 && todayMonth === displayedMonth && todayDay && (todayWeek || schedule) && (_jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [todayWeek && (_jsxs("span", { className: "text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60", children: ["hôm nay ngày ", todayDay, " · ", todayWeek] })), schedule && (_jsx("span", { className: "text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-200", children: schedule }))] }))] }), _jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar p-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-white/45 select-none", children: [_jsx("div", { className: "text-red-300/70", children: "CN" }), _jsx("div", { children: "T2" }), _jsx("div", { children: "T3" }), _jsx("div", { children: "T4" }), _jsx("div", { children: "T5" }), _jsx("div", { children: "T6" }), _jsx("div", { className: "text-red-300/70", children: "T7" })] }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: gridCells.map((day, idx) => {
                            if (!day) {
                                return _jsx("div", { className: "aspect-square rounded-xl border border-white/5 bg-white/0" }, idx);
                            }
                            const isToday = displayedYearOffset === 0 && todayMonth === displayedMonth && todayDay === day;
                            const isSelected = selectedDay === day;
                            const events = eventsForDay(displayedMonth, day);
                            const hasHoliday = events.some(e => e.kind === 'holiday');
                            const hasFestival = events.some(e => e.kind === 'festival');
                            const primary = events[0] ? formatEventTitleForCell(events[0]) : null;
                            return (_jsxs("button", { onClick: () => setSelectedDay(day), className: [
                                    'aspect-square rounded-xl border p-2 flex flex-col items-start justify-between text-left transition-colors',
                                    'bg-black/20 hover:bg-white/5',
                                    isSelected ? 'border-cyan-400/40' : 'border-white/10',
                                    isToday ? 'ring-2 ring-cyan-400/30 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]' : '',
                                ].join(' '), children: [_jsxs("div", { className: "w-full flex items-start justify-between", children: [_jsx("div", { className: ['text-[11px] font-bold tabular-nums', isToday ? 'text-cyan-200' : 'text-white/80'].join(' '), children: day }), (hasHoliday || hasFestival) && (_jsx("div", { className: [
                                                    'text-[9px] px-1.5 py-0.5 rounded-full border',
                                                    hasHoliday
                                                        ? 'bg-red-500/10 border-red-400/30 text-red-200'
                                                        : 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-200',
                                                ].join(' '), children: hasHoliday ? 'nghỉ' : 'lễ' }))] }), _jsxs("div", { className: "w-full", children: [primary && (_jsxs("div", { className: [
                                                    'text-[9px] leading-tight truncate',
                                                    hasHoliday ? 'text-red-200/90' : hasFestival ? 'text-fuchsia-200/90' : 'text-white/55',
                                                ].join(' '), children: [primary, events.length > 1 ? ` +${events.length - 1}` : ''] })), events.length > 0 && (_jsx("div", { className: "mt-1 flex items-center gap-1", children: events.slice(0, 3).map((e, i) => (_jsx("span", { className: [
                                                        'w-1.5 h-1.5 rounded-full',
                                                        e.kind === 'holiday'
                                                            ? 'bg-red-400/80'
                                                            : e.kind === 'festival'
                                                                ? 'bg-fuchsia-400/80'
                                                                : 'bg-white/25',
                                                    ].join(' ') }, i))) }))] })] }, idx));
                        }) }), _jsxs("div", { className: "p-4 rounded-2xl border border-white/10 bg-white/5", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "text-xs font-bold text-white/80", children: ["ngày ", selectedDay, " tháng ", displayedMonth, todayMonth === displayedMonth && todayDay === selectedDay && (_jsx("span", { className: "ml-2 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-200", children: "hôm nay" }))] }), _jsxs("div", { className: "text-[10px] text-white/40", children: [selectedEvents.length, " mục"] })] }), selectedEvents.length === 0 ? (_jsx("div", { className: "text-[11px] text-white/45", children: "hôm nay không có sự kiện đã ghi" })) : (_jsx("div", { className: "space-y-2", children: selectedEvents.map((e, i) => (_jsxs("div", { className: "p-3 rounded-xl border border-white/10 bg-black/20 flex items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-[11px] font-semibold text-white/85 truncate", children: e.title }), e.start !== e.end && (_jsxs("div", { className: "text-[10px] text-white/45 mt-0.5", children: ["ngày ", e.start, "-", e.end, " tháng ", displayedMonth] }))] }), _jsx("div", { className: [
                                                'shrink-0 text-[10px] px-2 py-1 rounded-full border',
                                                e.kind === 'holiday'
                                                    ? 'bg-red-500/10 border-red-400/30 text-red-200'
                                                    : e.kind === 'festival'
                                                        ? 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-200'
                                                        : 'bg-white/5 border-white/10 text-white/55',
                                            ].join(' '), children: e.kind === 'holiday' ? 'ngày nghỉ' : e.kind === 'festival' ? 'ngày lễ' : 'sự kiện' })] }, i))) }))] })] })] }));
};
export const HelpApp = ({ onBack }) => _jsx(HelpAppInner, { onBack: onBack });
function normalizeInventory(value) {
    if (value === null || value === undefined)
        return [];
    if (Array.isArray(value)) {
        return value.map(item => ({ name: String(item) }));
    }
    if (typeof value === 'object') {
        const record = value;
        return Object.keys(record)
            .map(key => {
            const v = record[key];
            if (v === null || v === undefined)
                return { name: key };
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                return { name: key, detail: String(v) };
            }
            if (Array.isArray(v)) {
                return { name: key, detail: v.map(item => String(item)).join(', ') };
            }
            if (typeof v === 'object') {
                const quantity = v.số_lượng;
                const description = v.mô_tả;
                const normalizedQuantity = typeof quantity === 'number' || typeof quantity === 'string' ? String(quantity).trim() : '';
                const normalizedDescription = typeof description === 'string' ? description.trim() : '';
                if (normalizedQuantity || normalizedDescription) {
                    return {
                        name: key,
                        quantity: normalizedQuantity || undefined,
                        description: normalizedDescription || undefined,
                    };
                }
            }
            try {
                return { name: key, detail: JSON.stringify(v) };
            }
            catch {
                return { name: key, detail: String(v) };
            }
        })
            .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }
    return [{ name: String(value) }];
}
export const InventoryApp = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [entries, setEntries] = useState([]);
    const loadInventory = async () => {
        setLoading(true);
        setError(null);
        try {
            const system = await MvuBridge.getSystem();
            if (!system) {
                setEntries([]);
                setError('chưa kết nối biến Tavern (MVU chưa khởi tạo hoặc không ở trong môi trường Tavern)');
                return;
            }
            setEntries(normalizeInventory(system.vật_phẩm_đang_có));
        }
        catch (err) {
            console.warn('[HypnoOS] đọc kho đồ thất bại', err);
            setEntries([]);
            setError('đọc thất bại: vui lòng thử lại sau');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadInventory();
    }, []);
    useEffect(() => {
        let stops = [];
        void (async () => {
            try {
                const ready = await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
                if (!ready)
                    return;
                stops = [
                    eventOn(Mvu.events.VARIABLE_INITIALIZED, () => void loadInventory()),
                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => void loadInventory()),
                ];
            }
            catch {
                // ignore
            }
        })();
        return () => stops.forEach(s => s.stop());
    }, []);
    return (_jsxs(PageLayout, { title: "kho đồ", onBack: onBack, color: "bg-gray-100", children: [error && (_jsx("div", { className: "mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700", children: error })), loading ? (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-10 rounded-xl bg-white animate-pulse" }), _jsx("div", { className: "h-10 rounded-xl bg-white animate-pulse" }), _jsx("div", { className: "h-10 rounded-xl bg-white animate-pulse" })] })) : entries.length === 0 ? (_jsxs("div", { className: "h-40 rounded-2xl bg-white flex flex-col items-center justify-center text-gray-400 text-sm", children: [_jsx(Package, { className: "mb-2" }), "chưa có vật phẩm đang có"] })) : (_jsx("div", { className: "space-y-2", children: entries.map(entry => (_jsxs("div", { className: "rounded-xl bg-white px-4 py-3 shadow-sm flex flex-col gap-1", children: [_jsx("div", { className: "text-sm font-semibold text-gray-800 truncate", children: displayText(entry.name) }), (entry.quantity || entry.description || entry.detail) && (_jsx("div", { className: "text-xs text-gray-500", children: entry.detail ? (displayText(entry.detail)) : (_jsxs(_Fragment, { children: [entry.quantity && _jsxs("span", { children: ["số lượng: ", displayText(entry.quantity)] }), entry.quantity && entry.description && _jsx("span", { className: "mx-2", children: "·" }), entry.description && _jsxs("span", { children: ["mô tả: ", displayText(entry.description)] })] })) }))] }, `${entry.name}-${entry.quantity ?? ''}-${entry.description ?? ''}-${entry.detail ?? ''}`))) }))] }));
};
const HelpCard = ({ title, onClick }) => (_jsxs("button", { type: "button", onClick: onClick, className: "w-full bg-white p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: title }), _jsx("span", { className: "text-gray-300", children: "→" })] }));
const HelpSection = ({ title, children }) => (_jsxs("div", { className: "bg-white p-4 rounded-xl shadow-sm", children: [_jsx("div", { className: "text-sm font-bold text-gray-800", children: title }), _jsx("div", { className: "mt-2 text-sm text-gray-600 leading-6", children: children })] }));
const HelpAppInner = ({ onBack }) => {
    const helpTopics = useMemo(() => [
        {
            id: 'core-stats',
            title: 'giải thích số trị cốt lõi (MC/cảnh giác/phục tùng/đáng ngờ)',
            content: (_jsxs("div", { className: "space-y-3", children: [_jsx(HelpSection, { title: "Năng lượng MC", children: "Dùng APP Thôi Miên sẽ tiêu hao năng lượng; mỗi chức năng có mức tiêu hao khác nhau. Mỗi ngày tự hồi phục tới 50% giới hạn." }), _jsx(HelpSection, { title: "Điểm MC", children: "Dùng để mở khóa chức năng và tăng giới hạn năng lượng MC." }), _jsx(HelpSection, { title: "Tiền", children: "Dùng để mua vật phẩm, cũng có thể mua năng lượng MC và điểm MC." }), _jsx(HelpSection, { title: "Độ cảnh giác", children: _jsxs("div", { className: "space-y-2", children: [_jsx("div", { children: "Mức nghi ngờ của nhân vật đối với nhân vật chính. Khi đạt 100, nhân vật sẽ biết nhân vật chính có APP Thôi Miên, sẽ hết sức tránh né và cố khiến nhân vật chính bị trừng phạt hoặc định tội." }), _jsxs("div", { children: ["Nguồn tăng:", _jsxs("ul", { className: "mt-1 list-disc pl-5 space-y-1", children: [_jsx("li", { children: "Khi thôi miên kết thúc, người kia nhìn thấy nhân vật chính và cảm giác cơ thể không ổn" }), _jsx("li", { children: "Quá trình thôi miên bị người khác nhìn thấy" }), _jsx("li", { children: "Thời điểm khiến đối phương bước vào thôi miên quá thiếu tự nhiên" })] })] }), _jsx("div", { children: "Mỗi khi độ cảnh giác tăng 5 điểm, độ đáng ngờ của nhân vật chính sẽ tự tăng 1 điểm mỗi ngày." })] }) }), _jsx(HelpSection, { title: "Độ phục tùng", children: "Tăng khi huấn luyện ngoài trạng thái thôi miên, biểu thị mức phục tùng của nhân vật khi ý thức tỉnh táo." }), _jsx(HelpSection, { title: "Độ đáng ngờ của nhân vật chính", children: "Mức xã hội nhìn nhận nhân vật chính là đáng ngờ. Lạm dụng APP Thôi Miên một cách công khai sẽ làm tăng chỉ số này, ví dụ bị nhiều người chứng kiến hoặc trực tiếp dùng thôi miên để lấy tiền. Mỗi ngày tự giảm 10 điểm." }), _jsx(HelpSection, { title: "Nguồn tiền", children: "Tiền có thể đến từ làm thêm, cũng có thể trực tiếp dùng thôi miên để lấy; hệ thống khuyến khích tận dụng các chức năng của APP Thôi Miên bằng cách chơi sáng tạo hơn." })] })),
        },
        {
            id: 'mc-points',
            title: 'làm sao nhận điểm MC?',
            content: _jsx("div", { className: "text-sm text-gray-600", children: "Thông qua hoàn thành thành tựu, nhiệm vụ, nạp tiền, hoặc khiến nhân vật cực khoái." }),
        },
    ], []);
    const [active, setActive] = useState(null);
    if (active) {
        return (_jsx(PageLayout, { title: active.title, onBack: () => setActive(null), color: "bg-gray-50", children: active.content }));
    }
    return (_jsxs(PageLayout, { title: "trung tâm trợ giúp", onBack: onBack, color: "bg-gray-50", children: [_jsx("div", { className: "space-y-3", children: helpTopics.map(topic => (_jsx(HelpCard, { title: topic.title, onClick: () => setActive(topic) }, topic.id))) }), _jsxs("div", { className: "mt-8 text-center text-xs text-gray-400", children: ["Version 1.0.0 ", _jsx("br", {}), "Internal Build"] })] }));
};
export const WipApp = ({ onBack, name }) => (_jsx(PageLayout, { title: name, onBack: onBack, children: _jsxs("div", { className: "h-full flex flex-col items-center justify-center text-gray-400 opacity-60", children: [_jsx(Construction, { size: 48, className: "mb-4" }), _jsx("p", { children: "đang xây dựng..." }), _jsx("p", { className: "text-xs mt-2", children: "Coming Soon" })] }) }));
