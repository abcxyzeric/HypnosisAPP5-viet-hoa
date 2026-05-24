import { jsx as _jsx } from "react/jsx-runtime";
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MvuBridge, waitForMvuReady } from './services/mvuBridge';
let root;
function ensureRootElement() {
    let rootElement = document.getElementById('app');
    if (!rootElement) {
        rootElement = document.createElement('div');
        rootElement.id = 'app';
        document.body.appendChild(rootElement);
    }
    return rootElement;
}
function mount() {
    const rootElement = ensureRootElement();
    root = ReactDOM.createRoot(rootElement);
    root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
}
function unmount() {
    root?.unmount();
    root = undefined;
}
function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
        return;
    }
    callback();
}
onReady(() => {
    void (async () => {
        try {
            await waitForMvuReady({ timeoutMs: 5000, pollMs: 150 });
        }
        catch {
            // ignore
        }
        void MvuBridge.resetThisTurnAppOperationLog();
        mount();
        window.addEventListener('pagehide', unmount);
    })();
});
