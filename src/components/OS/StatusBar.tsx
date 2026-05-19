import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
export const StatusBar = ({ timeText }) => {
    return (_jsxs("div", { className: "w-full h-8 px-5 flex justify-between items-center text-white/90 text-xs font-medium z-50 select-none mix-blend-difference", children: [_jsx("div", { className: "w-20", children: timeText || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Signal, { size: 12 }), _jsx(Wifi, { size: 12 }), _jsx(Battery, { size: 14 })] })] }));
};
