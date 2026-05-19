// Enum for application state (which app is open)
export var AppMode;
(function (AppMode) {
    AppMode["HOME"] = "HOME";
    AppMode["HYPNOSIS"] = "HYPNOSIS";
    AppMode["BODY_STATS"] = "BODY_STATS";
    AppMode["CALENDAR"] = "CALENDAR";
    AppMode["HELP"] = "HELP";
    AppMode["INVENTORY"] = "INVENTORY";
    AppMode["ACHIEVEMENTS"] = "ACHIEVEMENTS";
    AppMode["WIP"] = "WIP";
})(AppMode || (AppMode = {}));
export const VIP_LEVELS = [
    { tier: 'TRIAL', unlockThreshold: 0, label: 'khu dùng thử' },
    { tier: 'VIP1', unlockThreshold: 0, label: 'VIP 1 (cơ bản)' },
    { tier: 'VIP2', unlockThreshold: 100, label: 'VIP 2 (nâng cao)' },
    { tier: 'VIP3', unlockThreshold: 250, label: 'VIP 3 (cao cấp)' },
    { tier: 'VIP4', unlockThreshold: 500, label: 'VIP 4 (chuyên sâu)' },
    { tier: 'VIP5', unlockThreshold: 1000, label: 'VIP 5 (vĩnh viễn)' },
    { tier: 'VIP6', unlockThreshold: 2500, label: 'VIP 6 (khống chế hoàn toàn)' },
];
