import _ from 'lodash';
const UPDATE_REASON = 'frontend APP Thôi Miên';
const THIS_TURN_APP_OPERATION_LOG_PATH = 'thao_tác_APP_lượt_này';
const DEFAULT_APP_OPERATION_LOG_VALUE = 'không_có';
let writeQueue = Promise.resolve();
function enqueueMvuWrite(task) {
    const next = writeQueue.then(task, task);
    writeQueue = next.then(() => undefined, () => undefined);
    return next;
}
function isMvuDefined() {
    return typeof globalThis.Mvu !== 'undefined';
}
function withTimeout(promise, timeoutMs, label) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
        return promise;
    return new Promise((resolve, reject) => {
        const timer = globalThis.setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs);
        promise.then(value => {
            globalThis.clearTimeout(timer);
            resolve(value);
        }, err => {
            globalThis.clearTimeout(timer);
            reject(err);
        });
    });
}
async function safeWaitGlobalInitialized(name, timeoutMs) {
    const maybeWait = globalThis.waitGlobalInitialized;
    if (typeof maybeWait !== 'function')
        return;
    await withTimeout(Promise.resolve(maybeWait(name)), timeoutMs, `waitGlobalInitialized(${name})`);
}
export async function waitForMvuReady(options = {}) {
    const timeoutMs = options.timeoutMs ?? 2500;
    const pollMs = options.pollMs ?? 100;
    if (isMvuDefined())
        return true;
    const maybeWait = globalThis.waitGlobalInitialized;
    if (typeof maybeWait !== 'function')
        return false;
    const deadline = Date.now() + Math.max(0, timeoutMs);
    while (Date.now() < deadline) {
        try {
            await safeWaitGlobalInitialized('Mvu', Math.min(pollMs, Math.max(0, deadline - Date.now())));
        }
        catch {
            // ignore
        }
        if (isMvuDefined())
            return true;
        await new Promise(resolve => globalThis.setTimeout(resolve, pollMs));
    }
    return isMvuDefined();
}
function getMessageVariableOption() {
    try {
        return { type: 'message', message_id: getCurrentMessageId() };
    }
    catch {
        return { type: 'message', message_id: 'latest' };
    }
}
async function getMvuData() {
    try {
        const ready = await waitForMvuReady();
        if (!ready)
            return null;
        const option = getMessageVariableOption();
        return { mvu: Mvu.getMvuData(option), option };
    }
    catch (err) {
        console.warn('[HypnoOS] Mvu chưa sẵn sàng, bỏ qua đồng bộ biến', err);
        return null;
    }
}
async function setIfChanged(mvu, path, nextValue, reason = UPDATE_REASON) {
    const prev = _.get(mvu.stat_data, path);
    if (_.isEqual(prev, nextValue))
        return false;
    const setter = Mvu.setMvuVariable;
    if (typeof setter === 'function') {
        const ok = await setter(mvu, path, nextValue, { reason });
        if (ok)
            _.set(mvu.stat_data, path, nextValue);
        return ok;
    }
    _.set(mvu.stat_data, path, nextValue);
    return true;
}
function normalizeAppOperationLogValue(value) {
    if (typeof value !== 'string')
        return DEFAULT_APP_OPERATION_LOG_VALUE;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : DEFAULT_APP_OPERATION_LOG_VALUE;
}
export const MvuBridge = {
    getStatData: async () => {
        const data = await getMvuData();
        if (!data)
            return null;
        return (data.mvu.stat_data ?? null);
    },
    getSystem: async () => {
        const data = await getMvuData();
        if (!data)
            return null;
        return (_.get(data.mvu, 'stat_data.hệ_thống') ?? null);
    },
    getRoles: async () => {
        const data = await getMvuData();
        if (!data)
            return null;
        const roles = _.get(data.mvu, 'stat_data.nhân_vật');
        return _.isPlainObject(roles) ? roles : null;
    },
    getTasks: async () => {
        const data = await getMvuData();
        if (!data)
            return null;
        const tasks = _.get(data.mvu, 'stat_data.nhiệm_vụ');
        return _.isPlainObject(tasks) ? tasks : null;
    },
    syncUserResources: async (user) => {
        return enqueueMvuWrite(async () => {
            const data = await getMvuData();
            if (!data)
                return;
            const { mvu, option } = data;
            let changed = false;
            if (await setIfChanged(mvu, 'hệ_thống._năng_lượng_MC', user.mcEnergy))
                changed = true;
            if (await setIfChanged(mvu, 'hệ_thống._giới_hạn_năng_lượng_MC', user.mcEnergyMax))
                changed = true;
            if (await setIfChanged(mvu, 'hệ_thống.điểm_MC_hiện_tại', user.mcPoints))
                changed = true;
            if (await setIfChanged(mvu, 'hệ_thống._tổng_điểm_MC_đã_tiêu_hao', user.totalConsumedMc))
                changed = true;
            if (await setIfChanged(mvu, 'hệ_thống.tiền_tiêu_vặt_đang_có', user.money))
                changed = true;
            if (await setIfChanged(mvu, 'hệ_thống.độ_đáng_ngờ_của_nhân_vật_chính', user.suspicion))
                changed = true;
            if (changed) {
                await Mvu.replaceMvuData(mvu, option);
            }
        });
    },
    setTask: async (taskName, payload) => {
        return enqueueMvuWrite(async () => {
            const data = await getMvuData();
            if (!data)
                return false;
            const { mvu, option } = data;
            const path = `nhiệm_vụ.${taskName}`;
            const prev = _.get(mvu.stat_data, path);
            if (_.isEqual(prev, payload))
                return false;
            _.set(mvu.stat_data, path, payload);
            await Mvu.replaceMvuData(mvu, option);
            return true;
        });
    },
    deleteTask: async (taskName) => {
        return enqueueMvuWrite(async () => {
            const data = await getMvuData();
            if (!data)
                return false;
            const { mvu, option } = data;
            const path = `nhiệm_vụ.${taskName}`;
            const prev = _.get(mvu.stat_data, path);
            if (typeof prev === 'undefined')
                return false;
            _.unset(mvu.stat_data, path);
            await Mvu.replaceMvuData(mvu, option);
            return true;
        });
    },
    syncPersistedStore: async (store) => {
        return enqueueMvuWrite(async () => {
            const data = await getMvuData();
            if (!data)
                return;
            const { mvu, option } = data;
            const changed = await setIfChanged(mvu, 'hệ_thống._hypnoos', store);
            if (changed) {
                await Mvu.replaceMvuData(mvu, option);
            }
        });
    },
    syncSubscriptionTier: async (tierLabel) => {
        return enqueueMvuWrite(async () => {
            if (typeof globalThis.Mvu === 'undefined')
                return;
            const data = await getMvuData();
            if (!data)
                return;
            const { mvu, option } = data;
            const changed = await setIfChanged(mvu, 'hệ_thống._cấp_đăng_ký_APP_thôi_miên', tierLabel);
            if (changed) {
                await Mvu.replaceMvuData(mvu, option);
            }
        });
    },
    resetThisTurnAppOperationLog: async () => {
        return enqueueMvuWrite(async () => {
            try {
                const data = await getMvuData();
                if (!data)
                    return false;
                const { mvu, option } = data;
                const changed = await setIfChanged(mvu, THIS_TURN_APP_OPERATION_LOG_PATH, DEFAULT_APP_OPERATION_LOG_VALUE);
                if (changed) {
                    await Mvu.replaceMvuData(mvu, option);
                }
                return changed;
            }
            catch (err) {
                console.warn('[HypnoOS] đặt lại thao tác APP lượt này thất bại', err);
                return false;
            }
        });
    },
    appendThisTurnAppOperationLog: async (entry) => {
        return enqueueMvuWrite(async () => {
            try {
                const normalizedEntry = typeof entry === 'string' ? entry.trim() : '';
                if (!normalizedEntry)
                    return false;
                const data = await getMvuData();
                if (!data)
                    return false;
                const { mvu, option } = data;
                const prev = normalizeAppOperationLogValue(_.get(mvu.stat_data, THIS_TURN_APP_OPERATION_LOG_PATH));
                const base = prev === DEFAULT_APP_OPERATION_LOG_VALUE ? '' : prev;
                const nextValue = base ? `${base}\n${normalizedEntry}` : normalizedEntry;
                const changed = await setIfChanged(mvu, THIS_TURN_APP_OPERATION_LOG_PATH, nextValue);
                if (changed) {
                    await Mvu.replaceMvuData(mvu, option);
                }
                return changed;
            }
            catch (err) {
                console.warn('[HypnoOS] ghi thao tác APP lượt này thất bại', err);
                return false;
            }
        });
    },
};
