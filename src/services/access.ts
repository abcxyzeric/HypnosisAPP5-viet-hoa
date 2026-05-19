import { VIP_LEVELS } from '../types';
export const SUBSCRIPTION_TIERS = ['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
function toFiniteNumber(value) {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}
export function getSubscriptionUnlockThreshold(tier) {
    const cfg = VIP_LEVELS.find(v => v.tier === tier);
    return toFiniteNumber(cfg?.unlockThreshold) ?? 0;
}
export function canSubscribeTier(ctx) {
    if (ctx.debugEnabled)
        return true;
    return ctx.totalConsumedMc >= getSubscriptionUnlockThreshold(ctx.tier);
}
export function isSubscriptionActive(ctx) {
    if (ctx.debugEnabled)
        return true;
    if (!ctx.subscription)
        return false;
    if (ctx.nowVirtualMinutes === null)
        return false;
    return ctx.subscription.endVirtualMinutes > ctx.nowVirtualMinutes;
}
function featureRequiredSubscriptionTier(feature) {
    if (feature.tier === 'TRIAL')
        return null;
    if (SUBSCRIPTION_TIERS.includes(feature.tier))
        return feature.tier;
    // Feature tiers above VIP5 still require the highest subscription tier.
    return 'VIP5';
}
export function canUseFeature(feature, ctx) {
    if (ctx.debugEnabled)
        return true;
    const required = featureRequiredSubscriptionTier(feature);
    if (required === null)
        return true;
    if (!isSubscriptionActive(ctx) || !ctx.subscription)
        return false;
    return SUBSCRIPTION_TIERS.indexOf(ctx.subscription.tier) >= SUBSCRIPTION_TIERS.indexOf(required);
}
export function getBodyStatsUnlocked(opts) {
    return opts.debugEnabled || opts.vip1StatsUnlocked;
}
