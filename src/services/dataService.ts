import { z } from 'zod';
import { QUEST_DB } from '../data/questDb';
import { canSubscribeTier, canUseFeature as canUseFeatureBySubscription, getBodyStatsUnlocked, getSubscriptionUnlockThreshold, isSubscriptionActive, SUBSCRIPTION_TIERS, } from './access';
import { MvuBridge } from './mvuBridge';
const CHAT_OPTION = { type: 'chat' };
const DEFAULT_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    mcPoints: 25,
    totalConsumedMc: 0,
    money: 6000,
    suspicion: 0,
};
const FEATURES = [
    // TRIAL
    {
        id: 'trial_basic',
        title: 'thôi miên phổ thông sơ cấp',
        description: 'Người bị thôi miên sẽ vô thức làm theo chỉ thị đơn giản; không thể ra lệnh cho đối tượng làm việc họ cực kỳ không muốn, nếu cưỡng ép sẽ thoát khỏi trạng thái thôi miên.',
        tier: 'TRIAL',
        costType: 'PER_MINUTE',
        costValue: 5,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập chỉ thị hành động đơn giản...',
    },
    // VIP 1
    {
        id: 'vip1_stats',
        title: 'hiển thị trạng thái nhân vật',
        description: 'Mở khóa APP xem thuộc tính cơ thể.',
        tier: 'VIP1',
        costType: 'ONE_TIME',
        costValue: 0,
        isEnabled: false,
    },
    {
        id: 'vip1_senses',
        title: 'chỉnh sửa vị giác và khứu giác',
        description: 'Đổi một mùi vị thành một mùi vị khác.',
        tier: 'VIP1',
        costType: 'PER_MINUTE',
        costValue: 4,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'mùi vị mục tiêu -> mùi vị thay thế',
    },
    {
        id: 'vip1_temp_sensitivity',
        title: 'chỉnh sửa độ nhạy tạm thời',
        description: 'Tạm thời chỉnh sửa độ nhạy của một bộ phận trên người bị thôi miên.',
        tier: 'VIP1',
        costType: 'PER_MINUTE',
        costValue: 5,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập bộ phận cần chỉnh sửa',
    },
    {
        id: 'vip1_truth_serum',
        title: 'ép nói thật',
        description: 'Cưỡng chế người bị thôi miên nói ra suy nghĩ thật trong lòng.',
        tier: 'VIP1',
        costType: 'PER_MINUTE',
        costValue: 4,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'câu hỏi muốn hỏi / lời dẫn dắt',
    },
    {
        id: 'vip1_estrus',
        title: 'kích dục',
        description: 'Cưỡng chế người bị thôi miên rơi vào trạng thái dục vọng.',
        tier: 'VIP1',
        costType: 'ONE_TIME',
        costValue: 1,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập mức dục vọng muốn tăng',
    },
    {
        id: 'vip1_memory_erase',
        title: 'xóa ký ức',
        description: 'Xóa ký ức trong một khoảng thời gian; nếu thời gian quá dài, mục tiêu có thể nghi ngờ vì bị thiếu ký ức.',
        tier: 'VIP1',
        costType: 'ONE_TIME',
        costValue: 5,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập thời lượng ký ức cần xóa',
    },
    // VIP 2
    {
        id: 'vip2_medium',
        title: 'thôi miên phổ thông trung cấp',
        description: 'Người bị thôi miên sẽ vô thức làm theo chỉ thị đơn giản; có thể ra lệnh làm những việc đối tượng thường không muốn, nhưng không thể ra lệnh làm việc họ cực kỳ chống cự, nếu cưỡng ép sẽ thoát khỏi trạng thái thôi miên.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip2_pleasure',
        title: 'ban khoái cảm',
        description: 'Tạo khoái cảm không rõ nguồn gốc ở một bộ phận.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 5,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'bộ phận',
    },
    {
        id: 'vip2_ghost_hand',
        title: 'bàn tay vô hình',
        description: 'Khiến người bị thôi miên ảo giác rằng mình luôn bị những bàn tay vô hình trêu đùa.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip2_body_lock',
        title: 'cố định cơ thể',
        description: 'Cưỡng chế cơ thể người bị thôi miên không thể cử động, nhưng ý thức vẫn tỉnh táo.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 12,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip2_pain_to_pleasure',
        title: 'chuyển hóa đau đớn',
        description: 'Chuyển cảm giác đau thành khoái cảm.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip2_emperors_new_clothes',
        title: 'bộ quần áo mới của hoàng đế',
        description: 'Khiến người bị thôi miên dù không mặc quần áo vẫn cảm thấy mình đang mặc đồ.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip2_new_emperor',
        title: 'vị hoàng đế của bộ quần áo mới',
        description: 'Khiến người bị thôi miên dù đang mặc quần áo vẫn cảm thấy mình không mặc gì.',
        tier: 'VIP2',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    // VIP 3
    {
        id: 'vip3_forced',
        title: 'cưỡng chế cực khoái',
        description: 'Trực tiếp cưỡng chế người bị thôi miên đạt cực khoái.',
        tier: 'VIP3',
        costType: 'ONE_TIME',
        costValue: 100,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip3_orgasm_ban',
        title: 'cấm cực khoái',
        description: 'Khiến mục tiêu vĩnh viễn không thể đạt cực khoái (bị giữ sát ngưỡng).',
        tier: 'VIP3',
        costType: 'ONE_TIME',
        costValue: 300,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip3_visual_filter',
        title: 'bộ lọc ảo giác',
        description: 'Người bị thôi miên sẽ nhìn người dùng thành một người khác.',
        tier: 'VIP3',
        costType: 'PER_MINUTE',
        costValue: 25,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip3_conditioned_reflex',
        title: 'cấy phản xạ có điều kiện',
        description: 'Khiến người bị thôi miên thực hiện một phản xạ có điều kiện nhất định khi gặp kích thích nhất định.',
        tier: 'VIP3',
        costType: 'ONE_TIME',
        costValue: 300,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'điều kiện kích hoạt -> hành vi phản xạ',
    },
    {
        id: 'vip3_temp_common_sense',
        title: 'sửa thường thức có thời hạn',
        description: 'Sửa một thường thức của người bị thôi miên trong một khoảng thời gian nhất định.',
        tier: 'VIP3',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập thường thức muốn sửa...',
    },
    {
        id: 'vip3_shame_invert',
        title: 'đảo ngược cảm giác xấu hổ',
        description: 'Trực tiếp chuyển cảm giác xấu hổ thành khoái cảm.',
        tier: 'VIP3',
        costType: 'PER_MINUTE',
        costValue: 10,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip3_temp_false_memory',
        title: 'ký ức giả tạm thời',
        description: 'Tạm thời cấy một đoạn ký ức vào người bị thôi miên.',
        tier: 'VIP3',
        costType: 'ONE_TIME',
        costValue: 250,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập ký ức muốn cấy...',
    },
    {
        id: 'vip3_pseudo_time_stop',
        title: 'giả dừng thời gian',
        description: 'Khiến hoạt động và ý thức của người bị thôi miên dừng tại trạng thái hiện tại; khoái cảm sẽ tích lũy và giải phóng cùng lúc khi kết thúc.',
        tier: 'VIP3',
        costType: 'PER_MINUTE',
        costValue: 30,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    // VIP 4
    {
        id: 'vip4_advanced',
        title: 'thôi miên phổ thông cao cấp',
        description: 'Người bị thôi miên sẽ vô thức làm theo chỉ thị đơn giản; có thể ra lệnh bất kỳ hành vi nào.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 40,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip4_closed_space_common_sense',
        title: 'sửa thường thức trong không gian kín',
        description: 'Sửa quy tắc hoặc thường thức trong một không gian kín.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 2,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập số người trong không gian + quy tắc/thường thức muốn sửa',
    },
    {
        id: 'vip4_excretion_control',
        title: 'kiểm soát bài tiết',
        description: 'Chỉ có thể bài tiết khi thỏa điều kiện đã chỉ định.',
        tier: 'VIP4',
        costType: 'ONE_TIME',
        costValue: 300,
        costCurrency: 'MC_POINTS',
        isEnabled: false,
        notePlaceholder: 'nhập điều kiện bài tiết...',
    },
    {
        id: 'vip4_control_body_keep_conscious',
        title: 'điều khiển cơ thể khi vẫn giữ ý thức',
        description: 'Cưỡng chế điều khiển cơ thể người bị thôi miên trong khi vẫn giữ ý thức của họ.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 50,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip4_control_body_no_conscious',
        title: 'điều khiển cơ thể không giữ ý thức',
        description: 'Cưỡng chế điều khiển cơ thể người bị thôi miên khi họ không còn ý thức.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 50,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip4_cognitive_block',
        title: 'cản trở nhận thức',
        description: 'Tàng hình về mặt tâm lý, khiến người khác không ý thức được sự tồn tại của mục tiêu.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 60,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    {
        id: 'vip4_fetish_implant',
        title: 'cấy sở thích tình dục',
        description: 'Vĩnh viễn cấy một sở thích tình dục vào người bị thôi miên.',
        tier: 'VIP4',
        costType: 'ONE_TIME',
        costValue: 800,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập sở thích tình dục muốn cấy...',
    },
    {
        id: 'vip4_temp_personality',
        title: 'cấy nhân cách tạm thời',
        description: 'Tạm thời cấy một nhân cách vào người bị thôi miên.',
        tier: 'VIP4',
        costType: 'PER_MINUTE',
        costValue: 50,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập thiết lập nhân cách...',
    },
    {
        id: 'vip4_lactation',
        title: 'dẫn phát tiết sữa',
        description: 'Chỉnh sửa hệ nội tiết, khiến phụ nữ không trong thời kỳ cho con bú cũng tiết sữa.',
        tier: 'VIP4',
        costType: 'ONE_TIME',
        costValue: 500,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
    },
    // VIP 5
    {
        id: 'vip5_permanent',
        title: 'sửa thường thức vĩnh viễn',
        description: 'Vĩnh viễn sửa một thường thức của người bị thôi miên.',
        tier: 'VIP5',
        costType: 'ONE_TIME',
        costValue: 2000,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập thường thức muốn sửa...',
    },
    {
        id: 'vip5_permanent_false_memory',
        title: 'ký ức giả vĩnh viễn',
        description: 'Vĩnh viễn cấy một đoạn ký ức vào người bị thôi miên.',
        tier: 'VIP5',
        costType: 'ONE_TIME',
        costValue: 1500,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập ký ức muốn cấy...',
    },
    {
        id: 'vip5_permanent_personality',
        title: 'cấy nhân cách vĩnh viễn',
        description: 'Vĩnh viễn cấy một nhân cách vào người bị thôi miên.',
        tier: 'VIP5',
        costType: 'ONE_TIME',
        costValue: 3000,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập thiết lập nhân cách...',
    },
    {
        id: 'vip5_open_space_common_sense',
        title: 'sửa thường thức trong không gian mở',
        description: 'Sửa quy tắc hoặc thường thức trong một không gian mở.',
        tier: 'VIP5',
        costType: 'PER_MINUTE',
        costValue: 100,
        costCurrency: 'MC_ENERGY',
        isEnabled: false,
        notePlaceholder: 'nhập quy tắc/thường thức muốn sửa...',
    },
];
const PURCHASE_PRICE_BY_TIER = {
    TRIAL: 0,
    VIP1: 10,
    VIP2: 50,
    VIP3: 150,
    VIP4: 300,
    VIP5: 1000,
    VIP6: 1000,
};
const FIRST_FEATURE_ID_BY_TIER = (() => {
    const map = new Map();
    for (const feature of FEATURES) {
        if (feature.tier === 'TRIAL')
            continue;
        if (!map.has(feature.tier))
            map.set(feature.tier, feature.id);
    }
    return map;
})();
function isPurchaseRequired(feature) {
    if (feature.tier === 'TRIAL')
        return false;
    const firstId = FIRST_FEATURE_ID_BY_TIER.get(feature.tier);
    return Boolean(firstId) && feature.id !== firstId;
}
function getPurchasePricePoints(feature) {
    if (!isPurchaseRequired(feature))
        return null;
    return PURCHASE_PRICE_BY_TIER[feature.tier] ?? PURCHASE_PRICE_BY_TIER.VIP5;
}
const STORE_SCHEMA = z
    .object({
    version: z.coerce.number().default(1),
    debugEnabled: z.coerce.boolean().default(false),
    sessionEndVirtualMinutes: z.coerce.number().optional(),
    sessionEndAtMs: z.coerce.number().optional(),
    hasUsedHypnosis: z.coerce.boolean().default(false),
    subscription: z
        .object({
        tier: z.enum(['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5']),
        endVirtualMinutes: z.coerce.number(),
        autoRenew: z.coerce.boolean().default(false),
    })
        .optional(),
    features: z
        .record(z.string(), z
        .object({
        isEnabled: z.boolean().optional(),
        userNote: z.string().optional(),
        userNumber: z.coerce.number().optional(),
    })
        .passthrough())
        .default({}),
    purchases: z.record(z.string(), z.coerce.boolean()).default({}),
    achievements: z.record(z.string(), z.boolean()).default({}),
    quests: z.record(z.string(), z.enum(['AVAILABLE', 'ACTIVE', 'COMPLETED', 'CLAIMED'])).default({}),
})
    .default({
    version: 1,
    debugEnabled: false,
    hasUsedHypnosis: false,
    features: {},
    purchases: {},
    achievements: {},
    quests: {},
});
function toFiniteNumber(value) {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}
function displayText(value) {
    return String(value ?? '').replace(/_/g, ' ');
}
function normalizeSystemAliases(systemRaw) {
    const existingEnergy = toFiniteNumber(systemRaw._năng_lượng_MC);
    if (existingEnergy === null) {
        const mcEnergy = toFiniteNumber(systemRaw.năng_lượng_MC);
        if (mcEnergy !== null)
            systemRaw._năng_lượng_MC = mcEnergy;
    }
    const existingEnergyMax = toFiniteNumber(systemRaw._giới_hạn_năng_lượng_MC);
    if (existingEnergyMax === null) {
        const mcEnergyMax = toFiniteNumber(systemRaw.giới_hạn_năng_lượng_MC);
        if (mcEnergyMax !== null)
            systemRaw._giới_hạn_năng_lượng_MC = mcEnergyMax;
    }
    return systemRaw;
}
function idSafe(part) {
    return encodeURIComponent(part).replaceAll('%', '_');
}
function makeAchievementId(prefix, ...parts) {
    return [prefix, ...parts.map(idSafe)].join('__');
}
export const SUBSCRIPTION_PRICES = {
    VIP1: 3000,
    VIP2: 6000,
    VIP3: 10000,
    VIP4: 20000,
    VIP5: 40000,
};
const SUBSCRIPTION_WEEK_MINUTES = 7 * 24 * 60;
function parseVirtualMinutesFrom(dateText, timeText) {
    if (!dateText || !timeText)
        return null;
    const dateMatch = dateText.match(/ngày\s*(\d+)\s*tháng\s*(\d+)/i);
    const timeMatch = timeText.match(/(\d{1,2})\s*:\s*(\d{1,2})(?:\s*:\s*(\d{1,2}))?/);
    if (!dateMatch || !timeMatch)
        return null;
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const seconds = timeMatch[3] === undefined ? 0 : Number(timeMatch[3]);
    if (![month, day, hours, minutes].every(Number.isFinite))
        return null;
    if (!Number.isFinite(seconds))
        return null;
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const mIndex = Math.max(1, Math.min(12, month)) - 1;
    const dIndex = Math.max(1, Math.min(monthDays[mIndex], day)) - 1;
    const dayOfYear = monthDays.slice(0, mIndex).reduce((a, b) => a + b, 0) + dIndex;
    const h = Math.max(0, Math.min(23, hours));
    const min = Math.max(0, Math.min(59, minutes));
    const sec = Math.max(0, Math.min(59, seconds));
    return dayOfYear * 24 * 60 + h * 60 + min + sec / 60;
}
function getSystemClockFrom(system) {
    const dateText = typeof system?.ngày_hiện_tại === 'string' ? system.ngày_hiện_tại : undefined;
    const timeText = typeof system?.thời_gian_hiện_tại === 'string' ? system.thời_gian_hiện_tại : undefined;
    return {
        dateText,
        timeText,
        virtualMinutes: parseVirtualMinutesFrom(dateText, timeText),
    };
}
async function getRolesAndSystemSnapshot() {
    let system = null;
    let roles = null;
    try {
        system = await MvuBridge.getSystem();
        if (system)
            normalizeSystemAliases(system);
        roles = await MvuBridge.getRoles();
    }
    catch {
        // ignore
    }
    if (system && roles)
        return { system, roles };
    const vars = getVariables(CHAT_OPTION);
    const normalized = normalizeChatVariables(vars);
    system ??= normalized.system;
    roles ??= vars?.nhân_vật ?? {};
    return { system, roles };
}
const SYSTEM_SCHEMA = z
    .object({
    _năng_lượng_MC: z.coerce.number().default(DEFAULT_USER_DATA.mcEnergy),
    _giới_hạn_năng_lượng_MC: z.coerce.number().default(DEFAULT_USER_DATA.mcEnergyMax),
    điểm_MC_hiện_tại: z.coerce.number().default(DEFAULT_USER_DATA.mcPoints),
    _tổng_điểm_MC_đã_tiêu_hao: z.coerce.number().default(DEFAULT_USER_DATA.totalConsumedMc),
    tiền_tiêu_vặt_đang_có: z.coerce.number().default(DEFAULT_USER_DATA.money),
    độ_đáng_ngờ_của_nhân_vật_chính: z.coerce.number().default(DEFAULT_USER_DATA.suspicion),
    _hypnoos: STORE_SCHEMA.optional(),
})
    .passthrough()
    .default({});
function systemToUserResources(system) {
    return {
        mcEnergy: system._năng_lượng_MC,
        mcEnergyMax: system._giới_hạn_năng_lượng_MC,
        mcPoints: system.điểm_MC_hiện_tại,
        totalConsumedMc: system._tổng_điểm_MC_đã_tiêu_hao,
        money: system.tiền_tiêu_vặt_đang_có,
        suspicion: system.độ_đáng_ngờ_của_nhân_vật_chính,
    };
}
function normalizeChatVariables(variables) {
    const systemRaw = normalizeSystemAliases(variables?.hệ_thống ?? {});
    const system = SYSTEM_SCHEMA.parse(systemRaw);
    system._hypnoos = STORE_SCHEMA.parse(system._hypnoos ?? {});
    variables.hệ_thống = system;
    return { variables, system, store: system._hypnoos };
}
async function updateStoreWith(updater) {
    let nextStore;
    updateVariablesWith(vars => {
        const { system, store } = normalizeChatVariables(vars);
        nextStore = STORE_SCHEMA.parse(updater(store));
        system._hypnoos = nextStore;
        vars.hệ_thống = system;
        return vars;
    }, CHAT_OPTION);
    const result = nextStore ?? STORE_SCHEMA.parse({});
    await MvuBridge.syncPersistedStore(result);
    return result;
}
const STATIC_ACHIEVEMENTS = [
    {
        id: 'ach_newbie',
        title: 'lần đầu tiếp xúc',
        description: 'Tổng tiêu hao vượt 10 điểm năng lượng MC.',
        rewardMcPoints: 5,
        checkCondition: u => u.totalConsumedMc >= 10,
    },
    {
        id: 'ach_vip2',
        title: 'hội viên nâng cao',
        description: 'Mở khóa quyền VIP 2 (tổng tiêu hao 100 MC).',
        rewardMcPoints: 20,
        checkCondition: u => u.totalConsumedMc >= 100,
    },
    {
        id: 'ach_rich',
        title: 'tài chính dư dả',
        description: 'Số tiền đang có vượt quá 50.000 yên.',
        rewardMcPoints: 10,
        checkCondition: u => u.money >= 50000,
    },
    {
        id: 'ach_sus',
        title: 'hành động bí mật',
        description: 'Giữ độ đáng ngờ dưới 5%.',
        rewardMcPoints: 50,
        checkCondition: u => u.suspicion <= 5,
    },
];
async function buildRoleBasedAchievements(store) {
    const { system, roles } = await getRolesAndSystemSnapshot();
    const achievements = [];
    achievements.push({
        id: 'ach_first_hypnosis',
        title: 'lần đầu dùng thôi miên',
        description: 'Lần đầu khởi động quy trình thôi miên.',
        rewardMcPoints: 15,
        checkCondition: () => Boolean(store.hasUsedHypnosis),
    });
    const suspicion = toFiniteNumber(system?.độ_đáng_ngờ_của_nhân_vật_chính) ?? 0;
    for (const t of [25, 50, 75, 100]) {
        achievements.push({
            id: makeAchievementId('ach_suspicion', String(t)),
            title: `độ đáng ngờ của nhân vật chính đạt ${t}`,
            description: `độ đáng ngờ của nhân vật chính đạt ${t}%`,
            rewardMcPoints: t,
            checkCondition: () => suspicion >= t,
        });
    }
    const energyMax = toFiniteNumber(system?._giới_hạn_năng_lượng_MC) ?? 0;
    const energyMaxThresholds = [
        [100, 10],
        [300, 30],
        [1000, 50],
    ];
    for (const [t, reward] of energyMaxThresholds) {
        achievements.push({
            id: makeAchievementId('ach_energy_max', String(t)),
            title: `giới hạn năng lượng MC đạt ${t}`,
            description: `giới hạn năng lượng MC đạt ${t}`,
            rewardMcPoints: reward,
            checkCondition: () => energyMax >= t,
        });
    }
    const sensitivityThresholds = [200, 300, 400, 500];
    const orgasmThresholds = [1, 5, 25, 100];
    const percentThresholds = [25, 50, 75, 100];
    for (const [roleName, roleDataRaw] of Object.entries(roles ?? {})) {
        if (!roleName)
            continue;
        if (!roleDataRaw || typeof roleDataRaw !== 'object')
            continue;
        const roleData = roleDataRaw;
        const roleLabel = displayText(roleName);
        const guard = toFiniteNumber(roleData['độ_cảnh_giác']) ?? 0;
        const obey = toFiniteNumber(roleData['độ_phục_tùng']) ?? 0;
        for (const t of percentThresholds) {
            achievements.push({
                id: makeAchievementId('ach_role_guard', roleName, String(t)),
                title: `${roleLabel} độ cảnh giác đạt ${t}`,
                description: `độ cảnh giác của ${roleLabel} đạt ${t}`,
                rewardMcPoints: t,
                checkCondition: () => guard >= t,
            });
            achievements.push({
                id: makeAchievementId('ach_role_obey', roleName, String(t)),
                title: `${roleLabel} độ phục tùng đạt ${t}`,
                description: `độ phục tùng của ${roleLabel} đạt ${t}`,
                rewardMcPoints: t,
                checkCondition: () => obey >= t,
            });
        }
        const sensitivityKeys = Object.keys(roleData).filter(k => k.includes('độ_nhạy'));
        for (const key of sensitivityKeys) {
            const value = toFiniteNumber(roleData[key]);
            if (value === null)
                continue;
            for (const t of sensitivityThresholds) {
                achievements.push({
                    id: makeAchievementId('ach_sensitivity', roleName, key, String(t)),
                    title: `${roleLabel}·${displayText(key)} ≥ ${t}`,
                    description: `${displayText(key)} của ${roleLabel} đạt ${t}`,
                    rewardMcPoints: 20,
                    checkCondition: () => value >= t,
                });
            }
        }
        const orgasmKeys = Object.keys(roleData).filter(k => k.includes('số_lần_cực_khoái'));
        for (const key of orgasmKeys) {
            const value = toFiniteNumber(roleData[key]);
            if (value === null)
                continue;
            for (const t of orgasmThresholds) {
                achievements.push({
                    id: makeAchievementId('ach_orgasm', roleName, key, String(t)),
                    title: `${roleLabel}·${displayText(key)} ≥ ${t}`,
                    description: `${displayText(key)} của ${roleLabel} đạt ${t}`,
                    rewardMcPoints: 20,
                    checkCondition: () => value >= t,
                });
            }
        }
    }
    return achievements;
}
function validateQuestDb(db) {
    const ids = new Set();
    const names = new Set();
    for (const q of db) {
        if (ids.has(q.id))
            throw new Error(`[HypnoOS] QUEST_DB trùng id: ${q.id}`);
        ids.add(q.id);
        if (names.has(q.name))
            throw new Error(`[HypnoOS] QUEST_DB trùng name: ${q.name}`);
        names.add(q.name);
    }
    return db;
}
const QUEST_DATABASE = validateQuestDb(QUEST_DB);
const PERSISTENT_FEATURE_IDS = new Set([]);
const SUBSCRIPTION_TIER_TRIAL_LABEL = 'thời_gian_dùng_thử';
function getSubscriptionTierLabel(subscription, nowVirtualMinutes) {
    if (!subscription)
        return SUBSCRIPTION_TIER_TRIAL_LABEL;
    if (nowVirtualMinutes === null)
        return null;
    return subscription.endVirtualMinutes > nowVirtualMinutes ? subscription.tier : SUBSCRIPTION_TIER_TRIAL_LABEL;
}
async function syncSubscriptionTierLabel(nowVirtualMinutes) {
    const { system, store } = normalizeChatVariables(getVariables(CHAT_OPTION));
    const subscription = store.subscription ?? null;
    const desired = getSubscriptionTierLabel(subscription, nowVirtualMinutes);
    if (desired === null)
        return;
    if (system._cấp_đăng_ký_APP_thôi_miên === desired)
        return;
    updateVariablesWith(vars => {
        const { system: nextSystem } = normalizeChatVariables(vars);
        nextSystem._cấp_đăng_ký_APP_thôi_miên = desired;
        vars.hệ_thống = nextSystem;
        return vars;
    }, CHAT_OPTION);
    await MvuBridge.syncSubscriptionTier(desired);
}
export const DataService = {
    getUnlocks: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const debugEnabled = Boolean(store.debugEnabled);
        const nowVirtualMinutes = (await DataService.getSystemClock()).virtualMinutes;
        const subscription = store.subscription ?? null;
        const accessContext = { debugEnabled, subscription, nowVirtualMinutes };
        const subscriptionActive = isSubscriptionActive(accessContext);
        let vip1StatsUnlocked = Boolean(store.purchases?.vip1_stats);
        // Tương thích dữ liệu cũ: nếu từng có đăng ký đủ để mở vip1_stats nhưng chưa ghi cờ mở khóa vĩnh viễn, tự ghi bổ sung một lần.
        if (!vip1StatsUnlocked && subscriptionActive) {
            await updateStoreWith(s => ({ ...s, purchases: { ...s.purchases, vip1_stats: true } }));
            vip1StatsUnlocked = true;
        }
        return { debugEnabled, bodyStatsUnlocked: getBodyStatsUnlocked({ debugEnabled, vip1StatsUnlocked }) };
    },
    getSubscriptionUnlockThreshold: (tier) => getSubscriptionUnlockThreshold(tier),
    canSubscribeTier: (tier, ctx) => canSubscribeTier({ tier, debugEnabled: ctx.debugEnabled, totalConsumedMc: ctx.totalConsumedMc }),
    isSubscriptionActive: (ctx) => isSubscriptionActive(ctx),
    canUseFeature: (feature, ctx) => {
        if (ctx.debugEnabled)
            return true;
        if (feature.id === 'vip1_stats') {
            const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
            if (store.purchases?.vip1_stats)
                return true;
        }
        return canUseFeatureBySubscription(feature, ctx);
    },
    getSubscriptionTiers: () => SUBSCRIPTION_TIERS,
    getUserData: async () => {
        let user;
        try {
            const mvuSystem = await MvuBridge.getSystem();
            if (mvuSystem) {
                user = systemToUserResources(SYSTEM_SCHEMA.parse(normalizeSystemAliases(mvuSystem)));
            }
        }
        catch (err) {
            console.warn('[HypnoOS] đọc biến hệ thống MVU thất bại, quay về biến chat', err);
        }
        updateVariablesWith(vars => {
            const { system } = normalizeChatVariables(vars);
            user ??= systemToUserResources(system);
            return vars;
        }, CHAT_OPTION);
        if (user) {
            updateVariablesWith(vars => {
                const { system, store } = normalizeChatVariables(vars);
                system._năng_lượng_MC = user.mcEnergy;
                system._giới_hạn_năng_lượng_MC = user.mcEnergyMax;
                system.điểm_MC_hiện_tại = user.mcPoints;
                system._tổng_điểm_MC_đã_tiêu_hao = user.totalConsumedMc;
                system.tiền_tiêu_vặt_đang_có = user.money;
                system.độ_đáng_ngờ_của_nhân_vật_chính = user.suspicion;
                system._hypnoos = store;
                vars.hệ_thống = system;
                return vars;
            }, CHAT_OPTION);
        }
        return user ?? DEFAULT_USER_DATA;
    },
    getSystemClock: async () => {
        const maybeSync = async (clock) => {
            try {
                await syncSubscriptionTierLabel(clock.virtualMinutes);
            }
            catch (err) {
                console.warn('[HypnoOS] đồng bộ biến cấp đăng ký thất bại', err);
            }
            return clock;
        };
        try {
            const mvuSystem = await MvuBridge.getSystem();
            if (mvuSystem)
                return await maybeSync(getSystemClockFrom(mvuSystem));
        }
        catch (err) {
            console.warn('[HypnoOS] đọc thời gian hệ thống MVU thất bại, quay về biến chat', err);
        }
        const { system } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return await maybeSync(getSystemClockFrom(system));
    },
    getSessionEnd: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const endVirtualMinutes = typeof store.sessionEndVirtualMinutes === 'number' && Number.isFinite(store.sessionEndVirtualMinutes)
            ? store.sessionEndVirtualMinutes
            : null;
        const endAtMs = typeof store.sessionEndAtMs === 'number' && Number.isFinite(store.sessionEndAtMs) ? store.sessionEndAtMs : null;
        return { endVirtualMinutes, endAtMs };
    },
    setSessionEnd: async ({ endVirtualMinutes, endAtMs, }) => {
        await updateStoreWith(store => {
            const next = { ...store };
            if (endVirtualMinutes === null || !Number.isFinite(endVirtualMinutes))
                delete next.sessionEndVirtualMinutes;
            else
                next.sessionEndVirtualMinutes = endVirtualMinutes;
            if (endAtMs === null || !Number.isFinite(endAtMs))
                delete next.sessionEndAtMs;
            else
                next.sessionEndAtMs = endAtMs;
            return next;
        });
    },
    clearSessionEnd: async () => {
        await DataService.setSessionEnd({ endVirtualMinutes: null, endAtMs: null });
    },
    getSubscription: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return store.subscription ?? null;
    },
    setSubscriptionAutoRenew: async (autoRenew) => {
        await updateStoreWith(store => ({
            ...store,
            subscription: store.subscription ? { ...store.subscription, autoRenew } : store.subscription,
        }));
    },
    clearSubscription: async () => {
        await updateStoreWith(store => {
            const next = { ...store };
            delete next.subscription;
            return next;
        });
        updateVariablesWith(vars => {
            const { system } = normalizeChatVariables(vars);
            if (system._cấp_đăng_ký_APP_thôi_miên === SUBSCRIPTION_TIER_TRIAL_LABEL)
                return vars;
            system._cấp_đăng_ký_APP_thôi_miên = SUBSCRIPTION_TIER_TRIAL_LABEL;
            vars.hệ_thống = system;
            return vars;
        }, CHAT_OPTION);
        await MvuBridge.syncSubscriptionTier(SUBSCRIPTION_TIER_TRIAL_LABEL);
    },
    subscribeOrRenew: async ({ tier, nowVirtualMinutes, extendFromExistingIfActive = true, }) => {
        if (nowVirtualMinutes === null)
            return { ok: false, message: 'không đọc được ngày/giờ hiện tại, không thể tính thời điểm hết hạn đăng ký' };
        const price = SUBSCRIPTION_PRICES[tier];
        const user = await DataService.getUserData();
        if (user.money < price)
            return { ok: false, message: 'không đủ tiền tiêu vặt' };
        const storeBefore = await updateStoreWith(s => s);
        const prev = storeBefore.subscription;
        const prevActive = Boolean(prev) && prev.endVirtualMinutes > nowVirtualMinutes;
        const base = extendFromExistingIfActive && prevActive
            ? Math.max(nowVirtualMinutes, prev.endVirtualMinutes)
            : nowVirtualMinutes;
        const nextSub = {
            tier,
            endVirtualMinutes: base + SUBSCRIPTION_WEEK_MINUTES,
            autoRenew: prev?.autoRenew ?? false,
        };
        await DataService.updateResources({
            money: user.money - price,
        });
        const next = await updateStoreWith(store => ({
            ...store,
            subscription: nextSub,
            // Sau khi mua hoặc đăng ký thành công một lần, vip1_stats được mở vĩnh viễn để hiện APP kiểm tra cơ thể ở màn hình chính.
            purchases: { ...store.purchases, vip1_stats: true },
        }));
        updateVariablesWith(vars => {
            const { system } = normalizeChatVariables(vars);
            if (system._cấp_đăng_ký_APP_thôi_miên === tier)
                return vars;
            system._cấp_đăng_ký_APP_thôi_miên = tier;
            vars.hệ_thống = system;
            return vars;
        }, CHAT_OPTION);
        await MvuBridge.syncSubscriptionTier(tier);
        return { ok: true, subscription: next.subscription ?? null };
    },
    maybeAutoRenewSubscription: async (nowVirtualMinutes) => {
        if (nowVirtualMinutes === null)
            return { renewed: false };
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const sub = store.subscription;
        if (!sub || !sub.autoRenew)
            return { renewed: false };
        if (sub.endVirtualMinutes > nowVirtualMinutes)
            return { renewed: false };
        const result = await DataService.subscribeOrRenew({
            tier: sub.tier,
            nowVirtualMinutes,
            extendFromExistingIfActive: false,
        });
        if (!result.ok)
            return { renewed: false, message: result.message };
        return { renewed: true };
    },
    getFeatures: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return FEATURES.map(f => ({
            ...f,
            isEnabled: store.features?.[f.id]?.isEnabled ?? f.isEnabled,
            userNote: store.features?.[f.id]?.userNote ?? f.userNote,
            userNumber: store.features?.[f.id]?.userNumber ?? f.userNumber,
            purchaseRequired: isPurchaseRequired(f),
            purchasePricePoints: getPurchasePricePoints(f) ?? undefined,
            isPurchased: !isPurchaseRequired(f) || Boolean(store.purchases?.[f.id]),
        }));
    },
    purchaseFeature: async (id) => {
        const feature = FEATURES.find(f => f.id === id);
        if (!feature)
            return { ok: false, message: 'không rõ chức năng' };
        const price = getPurchasePricePoints(feature);
        if (price === null)
            return { ok: false, message: 'chức năng này không cần mua' };
        const storeBefore = await updateStoreWith(s => s);
        if (storeBefore.purchases?.[id])
            return { ok: false, message: 'đã mua' };
        const user = await DataService.getUserData();
        if (user.mcPoints < price)
            return { ok: false, message: `không đủ điểm MC: cần ${price} PT` };
        await updateStoreWith(store => ({ ...store, purchases: { ...store.purchases, [id]: true } }));
        const nextUser = await DataService.updateResources({
            mcPoints: user.mcPoints - price,
            totalConsumedMc: user.totalConsumedMc + price,
        });
        return { ok: true, user: nextUser };
    },
    getDebugEnabled: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return Boolean(store.debugEnabled);
    },
    setDebugEnabled: async (enabled) => {
        await updateStoreWith(store => ({ ...store, debugEnabled: enabled }));
    },
    updateResources: async (newData) => {
        const merged = { ...(await DataService.getUserData()), ...newData };
        updateVariablesWith(vars => {
            const { system, store } = normalizeChatVariables(vars);
            system._năng_lượng_MC = merged.mcEnergy;
            system._giới_hạn_năng_lượng_MC = merged.mcEnergyMax;
            system.điểm_MC_hiện_tại = merged.mcPoints;
            system._tổng_điểm_MC_đã_tiêu_hao = merged.totalConsumedMc;
            system.tiền_tiêu_vặt_đang_có = merged.money;
            system.độ_đáng_ngờ_của_nhân_vật_chính = merged.suspicion;
            system._hypnoos = store;
            vars.hệ_thống = system;
            return vars;
        }, CHAT_OPTION);
        await MvuBridge.syncUserResources(merged);
        return merged;
    },
    startSession: async (payload) => {
        console.log('[Backend] Session Started:', payload);
        await updateStoreWith(store => ({ ...store, hasUsedHypnosis: true }));
        return true;
    },
    updateFeature: async (id, patch) => {
        await updateStoreWith(store => ({
            ...store,
            features: { ...store.features, [id]: { ...store.features[id], ...patch } },
        }));
    },
    resetFeatures: async () => {
        await updateStoreWith(store => {
            const preserved = {};
            for (const [id, state] of Object.entries(store.features ?? {})) {
                if (!PERSISTENT_FEATURE_IDS.has(id))
                    continue;
                preserved[id] = state;
            }
            return { ...store, features: preserved };
        });
    },
    getAchievements: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const dynamic = await buildRoleBasedAchievements(store);
        const all = [...STATIC_ACHIEVEMENTS, ...dynamic];
        return all.map(a => ({ ...a, isClaimed: store.achievements[a.id] ?? false }));
    },
    getQuests: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const claimed = store.quests ?? {};
        const tasks = (await MvuBridge.getTasks().catch(() => null)) ?? {};
        const quests = QUEST_DATABASE.map(q => {
            const locked = claimed[q.id] === 'CLAIMED';
            if (locked) {
                return {
                    id: q.id,
                    title: q.name,
                    description: q.condition,
                    rewardMcPoints: q.rewardMcPoints,
                    status: 'CLAIMED',
                };
            }
            const taskState = tasks[q.name];
            const completed = Boolean(taskState && typeof taskState === 'object' && taskState.đã_hoàn_thành === true);
            const active = Boolean(taskState && typeof taskState === 'object' && typeof taskState.đã_hoàn_thành === 'boolean');
            return {
                id: q.id,
                title: q.name,
                description: q.condition,
                rewardMcPoints: q.rewardMcPoints,
                status: completed
                    ? 'COMPLETED'
                    : active
                        ? 'ACTIVE'
                        : 'AVAILABLE',
            };
        });
        const order = { COMPLETED: 0, ACTIVE: 1, AVAILABLE: 2, CLAIMED: 3 };
        quests.sort((a, b) => order[a.status] - order[b.status]);
        return quests;
    },
    claimAchievement: async (id, currentPoints) => {
        const achievements = await DataService.getAchievements();
        const ach = achievements.find(a => a.id === id);
        if (!ach)
            return { success: false, newPoints: currentPoints };
        const store = await updateStoreWith(s => s);
        if (store.achievements[id])
            return { success: false, newPoints: currentPoints };
        const user = await DataService.getUserData();
        if (!ach.checkCondition(user))
            return { success: false, newPoints: currentPoints };
        const newPoints = currentPoints + ach.rewardMcPoints;
        await DataService.updateResources({ mcPoints: newPoints });
        await updateStoreWith(s => ({ ...s, achievements: { ...s.achievements, [id]: true } }));
        return { success: true, newPoints };
    },
    acceptQuest: async (id) => {
        const def = QUEST_DATABASE.find(q => q.id === id);
        if (!def)
            return { success: false, message: 'không rõ nhiệm vụ' };
        if (def.name.includes('.'))
            return { success: false, message: 'tên nhiệm vụ không được chứa dấu chấm' };
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        if (store.quests?.[def.id] === 'CLAIMED')
            return { success: false, message: 'nhiệm vụ này đã hoàn thành và bị khóa' };
        const tasks = await MvuBridge.getTasks();
        if (!tasks)
            return { success: false, message: 'MVU chưa sẵn sàng, không thể nhận nhiệm vụ' };
        const activeTaskNames = Object.entries(tasks).filter(([, v]) => v && typeof v === 'object' && typeof v.đã_hoàn_thành === 'boolean');
        if (activeTaskNames.length >= 3)
            return { success: false, message: 'chỉ có thể nhận tối đa 3 nhiệm vụ cùng lúc' };
        if (tasks[def.name])
            return { success: false, message: 'nhiệm vụ này đang được thực hiện' };
        try {
            await MvuBridge.setTask(def.name, { điều_kiện_hoàn_thành: def.condition, đã_hoàn_thành: false });
            const after = await MvuBridge.getTasks();
            if (!after || !(def.name in after)) {
                return { success: false, message: 'nhận thất bại: nhiệm vụ chưa được ghi vào MVU (hãy xác nhận schema MVU đã có mục nhiệm vụ)' };
            }
            return { success: true };
        }
        catch (err) {
            console.warn('[HypnoOS] ghi nhiệm vụ khi nhận thất bại', err);
            return { success: false, message: 'nhận thất bại: lỗi khi ghi vào MVU' };
        }
    },
    cancelQuest: async (id) => {
        const def = QUEST_DATABASE.find(q => q.id === id);
        if (!def)
            return { success: false, message: 'không rõ nhiệm vụ' };
        if (def.name.includes('.'))
            return { success: false, message: 'tên nhiệm vụ không được chứa dấu chấm' };
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        if (store.quests?.[def.id] === 'CLAIMED')
            return { success: false, message: 'nhiệm vụ này đã hoàn thành và bị khóa' };
        const tasks = await MvuBridge.getTasks();
        if (!tasks)
            return { success: false, message: 'MVU chưa sẵn sàng, không thể hủy nhiệm vụ' };
        if (!(def.name in tasks))
            return { success: false, message: 'nhiệm vụ này không đang được thực hiện' };
        try {
            await MvuBridge.deleteTask(def.name);
            const after = await MvuBridge.getTasks();
            if (after && def.name in after)
                return { success: false, message: 'hủy thất bại: nhiệm vụ chưa bị xóa khỏi MVU' };
            return { success: true };
        }
        catch (err) {
            console.warn('[HypnoOS] hủy nhiệm vụ thất bại', err);
            return { success: false, message: 'hủy thất bại: lỗi khi ghi vào MVU' };
        }
    },
    claimQuest: async (id, currentPoints) => {
        const def = QUEST_DATABASE.find(q => q.id === id);
        if (!def)
            return { success: false, newPoints: currentPoints };
        if (def.name.includes('.'))
            return { success: false, newPoints: currentPoints };
        const tasks = await MvuBridge.getTasks();
        if (!tasks)
            return { success: false, newPoints: currentPoints };
        const taskState = tasks[def.name];
        if (!taskState || typeof taskState !== 'object' || taskState.đã_hoàn_thành !== true)
            return { success: false, newPoints: currentPoints };
        const newPoints = currentPoints + def.rewardMcPoints;
        await DataService.updateResources({ mcPoints: newPoints });
        await updateStoreWith(s => ({ ...s, quests: { ...s.quests, [id]: 'CLAIMED' } }));
        await MvuBridge.deleteTask(def.name);
        return { success: true, newPoints };
    },
};
