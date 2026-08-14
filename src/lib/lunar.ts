/**
 * 农历/公历核心计算工具
 * 基于 lunar-javascript 库封装
 */

// lunar-javascript 没有 TypeScript 类型定义，使用 require 方式引入
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar, HolidayUtil } = require('lunar-javascript');

/** 天干 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 生肖 */
export const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/** 五行对照 */
export const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

/** 五行对应CSS类 */
export function getWuxingClass(wuxing: string): string {
  const map: Record<string, string> = {
    '木': 'tag-wood', '火': 'tag-fire', '土': 'tag-earth', '金': 'tag-metal', '水': 'tag-water',
  };
  return map[wuxing] || '';
}

/** 称骨重量表（年柱） */
const CHENG_GU_YEAR: Record<string, number> = {
  '甲子': 1.2, '乙丑': 0.9, '丙寅': 0.6, '丁卯': 0.7, '戊辰': 1.2,
  '己巳': 0.5, '庚午': 0.9, '辛未': 0.8, '壬申': 0.7, '癸酉': 0.8,
  '甲戌': 1.5, '乙亥': 0.9, '丙子': 1.6, '丁丑': 0.8, '戊寅': 0.8,
  '己卯': 1.9, '庚辰': 1.2, '辛巳': 0.6, '壬午': 0.8, '癸未': 0.7,
  '甲申': 0.5, '乙酉': 1.5, '丙戌': 0.6, '丁亥': 1.6, '戊子': 1.5,
  '己丑': 0.7, '庚寅': 0.9, '辛卯': 1.2, '壬辰': 1.0, '癸巳': 0.7,
  '甲午': 1.5, '乙未': 0.6, '丙申': 0.5, '丁酉': 1.4, '戊戌': 1.5,
  '己亥': 0.9, '庚子': 0.7, '辛丑': 0.7, '壬寅': 0.9, '癸卯': 1.2,
  '甲辰': 0.8, '乙巳': 0.7, '丙午': 1.3, '丁未': 0.5, '戊申': 1.4,
  '己酉': 0.5, '庚戌': 0.9, '辛亥': 1.7, '壬子': 0.5, '癸丑': 0.7,
  '甲寅': 1.2, '乙卯': 0.8, '丙辰': 0.8, '丁巳': 0.7, '戊午': 1.9,
  '己未': 0.6, '庚申': 0.8, '辛酉': 1.6, '壬戌': 1.0, '癸亥': 0.7,
};

/** 称骨重量表（月份 - 农历月） */
const CHENG_GU_MONTH: Record<number, number> = {
  1: 0.6, 2: 0.7, 3: 1.8, 4: 0.9, 5: 0.5, 6: 1.6,
  7: 0.9, 8: 1.5, 9: 1.8, 10: 0.8, 11: 0.9, 12: 0.5,
};

/** 称骨重量表（日 - 农历日） */
const CHENG_GU_DAY: Record<number, number> = {
  1: 0.5, 2: 1.0, 3: 0.8, 4: 1.5, 5: 1.6, 6: 1.5, 7: 0.8, 8: 1.6, 9: 0.8, 10: 1.6,
  11: 0.9, 12: 1.7, 13: 0.8, 14: 1.7, 15: 1.0, 16: 0.8, 17: 0.9, 18: 1.8, 19: 0.5, 20: 1.5,
  21: 1.0, 22: 0.9, 23: 0.8, 24: 0.9, 25: 1.5, 26: 1.8, 27: 0.7, 28: 0.8, 29: 1.6, 30: 0.6,
};

/** 称骨重量表（时辰） */
const CHENG_GU_HOUR: Record<string, number> = {
  '子': 1.6, '丑': 0.6, '寅': 0.7, '卯': 1.0, '辰': 0.9, '巳': 1.6,
  '午': 1.0, '未': 0.8, '申': 0.8, '酉': 0.9, '戌': 0.6, '亥': 0.6,
};

/** 称骨批语 */
const CHENG_GU_COMMENT: Record<string, string> = {
  '2.1': '终身行乞孤苦之命',
  '2.2': '一生劳碌之命',
  '2.3': '终身困苦之命',
  '2.4': '一生薄福之命',
  '2.5': '为人聪明之命',
  '2.6': '衣禄无亏之命',
  '2.7': '一生衣禄自然来',
  '2.8': '一生行事似飘蓬',
  '2.9': '早年运限未曾亨',
  '3.0': '劳劳碌碌苦中求',
  '3.1': '忙忙碌碌苦中求',
  '3.2': '初年运蹇事难谋',
  '3.3': '早年做事事难成',
  '3.4': '此命福气果如何',
  '3.5': '生平福量不周全',
  '3.6': '不须劳碌过平生',
  '3.7': '此命般般事不成',
  '3.8': '一身骨肉最清高',
  '3.9': '此命终身运不通',
  '4.0': '平生衣禄是绵长',
  '4.1': '此命推来自不同',
  '4.2': '得宽怀处且宽怀',
  '4.3': '为人心性最聪明',
  '4.4': '万事由天莫苦求',
  '4.5': '名利推来竟若何',
  '4.6': '东西南北尽皆通',
  '4.7': '此命推来旺末年',
  '4.8': '初年运道未曾通',
  '4.9': '此命推来福不轻',
  '5.0': '为利为名终日劳',
  '5.1': '一世荣华事事通',
  '5.2': '一世亨通事事能',
  '5.3': '此格推来气象真',
  '5.4': '此命推来厚且清',
  '5.5': '走马扬鞭争利名',
  '5.6': '此格推来礼义通',
  '5.7': '福禄丰盈万事全',
  '5.8': '平生福禄自然来',
  '5.9': '细推此格妙且清',
  '6.0': '一朝金榜快题名',
  '6.1': '不作朝中金榜客',
  '6.2': '此命生来福不穷',
  '6.3': '命主为官福禄长',
  '6.4': '此格威权不可当',
  '6.5': '细推此命福不轻',
  '6.6': '此格人间一福人',
  '6.7': '此命生来福自宏',
  '6.8': '富贵由天莫苦求',
  '6.9': '君是人间衣禄星',
  '7.0': '此命推来福不轻',
  '7.1': '此命生成大不同',
  '7.2': '此格世界罕有生',
};

export interface CalendarResult {
  // 公历
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  solarWeek: string;

  // 农历
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  lunarYearName: string;
  isLeapMonth: boolean;

  // 干支
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;

  // 纳音
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;
  timeNaYin: string;

  // 五行
  yearWuxing: string[];
  monthWuxing: string[];
  dayWuxing: string[];
  timeWuxing: string[];

  // 生肖
  shengXiao: string;

  // 节气
  currentJieQi: string | null;
  nextJieQi: { name: string; date: string } | null;

  // 宜忌
  yi: string[];
  ji: string[];

  // 节日
  festivals: string[];

  // 星座
  xingZuo: string;

  // 彭祖百忌
  pengZu: string;

  // 冲煞
  chong: string;
  sha: string;

  // 胎神
  taiShen: string;
}

export interface ChengGuResult {
  yearWeight: number;
  monthWeight: number;
  dayWeight: number;
  hourWeight: number;
  totalWeight: number;
  totalWeightStr: string;
  comment: string;
}

/**
 * 根据公历日期和时辰获取完整历法信息
 */
export function getCalendarInfo(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
): CalendarResult {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();

  // 时辰对应的地支索引（保留用于其他计算）
  const timeZhiIndex = Math.floor(((hour + 1) % 24) / 2);
  const timeGanZhi = lunar.getTimeInGanZhi();

  // 获取节气
  const jieQi = lunar.getCurrentJieQi();
  const nextJieQi = lunar.getNextJieQi(true);

  // 获取宜忌
  const dayYi = lunar.getDayYi() || [];
  const dayJi = lunar.getDayJi() || [];

  // 获取节日
  const festivals: string[] = [];
  const solarFestivals = solar.getFestivals() || [];
  const lunarFestivals = lunar.getFestivals() || [];
  const otherFestivals = lunar.getOtherFestivals() || [];
  festivals.push(...solarFestivals, ...lunarFestivals, ...otherFestivals);

  // 五行
  const yearGZ = lunar.getYearInGanZhi();
  const monthGZ = lunar.getMonthInGanZhi();
  const dayGZ = lunar.getDayInGanZhi();

  return {
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    solarWeek: solar.getWeekInChinese(),

    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    lunarMonthName: lunar.getMonthInChinese(),
    lunarDayName: lunar.getDayInChinese(),
    lunarYearName: lunar.getYearInChinese(),
    isLeapMonth: lunar.getMonth() < 0,

    yearGanZhi: yearGZ,
    monthGanZhi: monthGZ,
    dayGanZhi: dayGZ,
    timeGanZhi: timeGanZhi,

    yearNaYin: lunar.getYearNaYin(),
    monthNaYin: lunar.getMonthNaYin(),
    dayNaYin: lunar.getDayNaYin(),
    timeNaYin: lunar.getTimeNaYin(),

    yearWuxing: [WU_XING_MAP[yearGZ[0]] || '', WU_XING_MAP[yearGZ[1]] || ''],
    monthWuxing: [WU_XING_MAP[monthGZ[0]] || '', WU_XING_MAP[monthGZ[1]] || ''],
    dayWuxing: [WU_XING_MAP[dayGZ[0]] || '', WU_XING_MAP[dayGZ[1]] || ''],
    timeWuxing: [WU_XING_MAP[timeGanZhi[0]] || '', WU_XING_MAP[timeGanZhi[1]] || ''],

    shengXiao: lunar.getYearShengXiao(),

    currentJieQi: jieQi ? jieQi.getName() : null,
    nextJieQi: nextJieQi
      ? { name: nextJieQi.getName(), date: nextJieQi.getSolar().toYmd() }
      : null,

    yi: dayYi,
    ji: dayJi,

    festivals,

    xingZuo: solar.getXingZuo(),

    pengZu: lunar.getPengZuGan() + ' ' + lunar.getPengZuZhi(),

    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),

    taiShen: lunar.getDayPositionTai(),
  };
}

/**
 * 称骨论命
 */
export function getChengGu(
  yearGanZhi: string,
  lunarMonth: number,
  lunarDay: number,
  hourZhi: string,
): ChengGuResult {
  const yearWeight = CHENG_GU_YEAR[yearGanZhi] || 0;
  const monthWeight = CHENG_GU_MONTH[Math.abs(lunarMonth)] || 0;
  const dayWeight = CHENG_GU_DAY[lunarDay] || 0;
  const hourWeight = CHENG_GU_HOUR[hourZhi] || 0;

  const total = yearWeight + monthWeight + dayWeight + hourWeight;
  const totalRounded = Math.round(total * 10) / 10;
  const key = totalRounded.toFixed(1);

  let comment = CHENG_GU_COMMENT[key] || '';
  if (!comment) {
    // 查找最近的
    const keys = Object.keys(CHENG_GU_COMMENT).map(Number).sort((a, b) => a - b);
    for (const k of keys) {
      if (k >= totalRounded) {
        comment = CHENG_GU_COMMENT[k.toFixed(1)] || '命格特殊，需详细推算';
        break;
      }
    }
    if (!comment) comment = '命格超群，福禄深厚';
  }

  return {
    yearWeight,
    monthWeight,
    dayWeight,
    hourWeight,
    totalWeight: totalRounded,
    totalWeightStr: `${Math.floor(totalRounded)}两${Math.round((totalRounded % 1) * 10)}钱`,
    comment,
  };
}

/**
 * 获取指定月份的农历月历数据
 */
export function getMonthCalendar(year: number, month: number) {
  const firstDay = Solar.fromYmd(year, month, 1);
  const daysInMonth = getDaysInMonth(year, month);
  const startWeekDay = firstDay.getWeek(); // 0=周日

  const days = [];

  // 填充前面的空白
  for (let i = 0; i < startWeekDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const solar = Solar.fromYmd(year, month, d);
    const lunar = solar.getLunar();
    const jieQi = lunar.getCurrentJieQi();
    const festivals = [
      ...solar.getFestivals(),
      ...lunar.getFestivals(),
    ];

    days.push({
      solarDay: d,
      lunarDay: lunar.getDayInChinese(),
      jieQi: jieQi ? jieQi.getName() : null,
      festivals,
      isToday:
        year === new Date().getFullYear() &&
        month === new Date().getMonth() + 1 &&
        d === new Date().getDate(),
    });
  }

  return days;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 获取时辰名称
 */
export function getShiChen(hour: number): string {
  const names = [
    '子时(23-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)',
    '辰时(7-9)', '巳时(9-11)', '午时(11-13)', '未时(13-15)',
    '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)',
  ];
  const index = Math.floor(((hour + 1) % 24) / 2);
  return names[index];
}

/**
 * 获取小时对应的地支
 */
export function getHourZhi(hour: number): string {
  const index = Math.floor(((hour + 1) % 24) / 2);
  return DI_ZHI[index];
}

// ==================== 八字排盘核心方法 ====================

/** 天干阴阳属性 */
export const GAN_YIN_YANG: Record<string, '阳' | '阴'> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
};

/** 五行相生: key 生 value（木生火、火生土、土生金、金生水、水生木） */
export const WX_GENERATES: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克: key 克 value（木克土、土克水、水克火、火克金、金克木） */
export const WX_CONTROLS: Record<string, string> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

/** 地支藏干（本气、中气、余气），顺序依照传统典籍 */
export const ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

/** 五行配色（文字色 + 背景色） */
export const WU_XING_COLORS: Record<string, { text: string; bg: string }> = {
  '木': { text: '#2E8B57', bg: '#E8F5E9' },
  '火': { text: '#C23B22', bg: '#FFEBEE' },
  '土': { text: '#FF8C00', bg: '#FFF3E0' },
  '金': { text: '#B8860B', bg: '#FFF8E1' },
  '水': { text: '#1E90FF', bg: '#E3F2FD' },
};

/**
 * 根据日主天干计算目标天干的十神
 *
 * 核心逻辑：
 * 1. 判断日干与目标干的五行关系（同我/我生/我克/克我/生我）
 * 2. 结合阴阳异同确定具体十神名称
 */
export function getShiShen(dayGan: string, targetGan: string): string {
  if (dayGan === targetGan) return '比肩';

  const dw = WU_XING_MAP[dayGan];
  const tw = WU_XING_MAP[targetGan];
  const dp = GAN_YIN_YANG[dayGan];
  const tp = GAN_YIN_YANG[targetGan];
  const same = dp === tp; // 阴阳是否相同

  if (dw === tw) return same ? '比肩' : '劫财';
  if (WX_GENERATES[dw] === tw) return same ? '食神' : '伤官';
  if (WX_CONTROLS[dw] === tw) return same ? '偏财' : '正财';
  if (WX_GENERATES[tw] === dw) return same ? '偏印' : '正印';
  if (WX_CONTROLS[tw] === dw) return same ? '七杀' : '正官';
  return '';
}

// ---- 八字数据类型 ----

/** 单柱数据 */
export interface BaziPillar {
  label: string;       // 年柱/月柱/日柱/时柱
  ganZhi: string;      // 干支组合，如 "甲子"
  gan: string;         // 天干
  zhi: string;         // 地支
  ganWuxing: string;   // 天干五行
  zhiWuxing: string;   // 地支五行
  naYin: string;       // 纳音
  shiShen: string;     // 十神（日柱为 "日主"）
  cangGan: { gan: string; wuxing: string; shiShen: string }[]; // 藏干及其十神
}

/** 五行分析结果 */
export interface WuxingAnalysis {
  /** 各五行在八字中出现次数（仅统计天干+地支共8字） */
  counts: Record<string, number>;
  total: number;
  /** 缺失的五行 */
  missing: string[];
  /** 最旺的五行 */
  strongest: string;
  /** 最弱的五行 */
  weakest: string;
  /** 偏旺五行（>=3） */
  strongElements: string[];
  /** 偏弱五行（=1） */
  weakElements: string[];
  /** 日主强弱 */
  dayMasterStrength: '偏强' | '中和' | '偏弱';
  /** 摘要文字 */
  summary: string;
}

/** 八字排盘完整结果 */
export interface BaziResult {
  pillars: BaziPillar[];
  dayMaster: string;         // 日主天干
  dayMasterWuxing: string;   // 日主五行
  dayMasterYinYang: string;  // 日主阴阳
  shengXiao: string;         // 生肖
  wuxingAnalysis: WuxingAnalysis;
  solarDate: string;         // 公历日期描述
  lunarDate: string;         // 农历日期描述
  taiYuan: string;           // 胎元
  mingGong: string;          // 命宫
}

/** 排盘选项 */
export interface BaziOptions {
  /** 是否农历输入 */
  isLunar?: boolean;
  /** 是否闰月（仅农历输入时有效） */
  isLeapMonth?: boolean;
  /**
   * 晚子时流派：
   * 1 = 晚子时(23:00-23:59)日柱按当天
   * 2 = 晚子时日柱按明天（默认，现代主流）
   */
  sect?: number;
  /** 是否按立春划分年柱（默认 true，八字标准；false 则按正月初一） */
  useLiChun?: boolean;
}

/**
 * 八字排盘核心方法
 *
 * 调用流程：
 * 1. 根据 isLunar 决定从公历/农历创建日期对象
 * 2. 通过 Solar.fromYmdHms 携带小时信息，确保时柱计算正确
 * 3. lunar.getEightChar() 获取四柱，默认以立春分年、以节分月
 * 4. 根据 useLiChun 决定年柱取值方式
 * 5. 逐柱构建 BaziPillar（含十神、藏干）
 * 6. 计算五行平衡
 */
export function getBaziResult(
  year: number,
  month: number,
  day: number,
  hour: number,
  options: BaziOptions = {},
): BaziResult {
  const {
    isLunar = false,
    isLeapMonth = false,
    sect = 2,
    useLiChun = true,
  } = options;

  // 1. 创建日期对象
  let solar, lunar;
  if (isLunar) {
    // 农历转公历：闰月用负数表示
    const actualMonth = isLeapMonth ? -Math.abs(month) : month;
    const lunarTemp = Lunar.fromYmd(year, actualMonth, day);
    const solarTemp = lunarTemp.getSolar();
    // 用转换后的公历日期 + 出生时辰重建，确保时柱正确
    solar = Solar.fromYmdHms(
      solarTemp.getYear(), solarTemp.getMonth(), solarTemp.getDay(), hour, 0, 0,
    );
    lunar = solar.getLunar();
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    lunar = solar.getLunar();
  }

  // 2. 获取八字对象并设置流派
  const eightChar = lunar.getEightChar();
  eightChar.setSect(sect);

  // 3. 取四柱：年柱根据 useLiChun 切换
  let yearGan: string, yearZhi: string, yearNaYin: string;
  if (useLiChun) {
    // 标准八字：以立春为年界
    yearGan = eightChar.getYearGan();
    yearZhi = eightChar.getYearZhi();
    yearNaYin = eightChar.getYearNaYin();
  } else {
    // 民俗版：以正月初一为年界
    const ygz = lunar.getYearInGanZhi();
    yearGan = ygz[0];
    yearZhi = ygz[1];
    yearNaYin = lunar.getYearNaYin();
  }

  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const timeGan = eightChar.getTimeGan();
  const timeZhi = eightChar.getTimeZhi();

  // 4. 构建四柱
  function buildPillar(
    label: string,
    gan: string,
    zhi: string,
    naYin: string,
    isDayPillar: boolean,
  ): BaziPillar {
    return {
      label,
      ganZhi: gan + zhi,
      gan,
      zhi,
      ganWuxing: WU_XING_MAP[gan] || '',
      zhiWuxing: WU_XING_MAP[zhi] || '',
      naYin,
      shiShen: isDayPillar ? '日主' : getShiShen(dayGan, gan),
      cangGan: (ZHI_CANG_GAN[zhi] || []).map((g) => ({
        gan: g,
        wuxing: WU_XING_MAP[g] || '',
        shiShen: getShiShen(dayGan, g),
      })),
    };
  }

  const pillars: BaziPillar[] = [
    buildPillar('年柱', yearGan, yearZhi, yearNaYin, false),
    buildPillar('月柱', monthGan, monthZhi, eightChar.getMonthNaYin(), false),
    buildPillar('日柱', dayGan, dayZhi, eightChar.getDayNaYin(), true),
    buildPillar('时柱', timeGan, timeZhi, eightChar.getTimeNaYin(), false),
  ];

  // 5. 五行分析
  const wuxingAnalysis = computeWuxingAnalysis(pillars, dayGan);

  // 6. 胎元 = 月干进一位 + 月支进三位
  const taiYuanGan = TIAN_GAN[(TIAN_GAN.indexOf(monthGan) + 1) % 10];
  const taiYuanZhi = DI_ZHI[(DI_ZHI.indexOf(monthZhi) + 3) % 12];

  // 7. 命宫：以月支和时支推算
  // 命宫地支 = 14 - 月支序 - 时支序（序号从寅=1起算）
  const yueIdx = (DI_ZHI.indexOf(monthZhi) - 2 + 12) % 12; // 寅=0
  const shiIdx = (DI_ZHI.indexOf(timeZhi) - 2 + 12) % 12;
  const mingZhiIdx = (14 - yueIdx - shiIdx + 24) % 12;
  const mingZhi = DI_ZHI[(mingZhiIdx + 2) % 12]; // 转回子=0 序列
  // 命宫天干：根据年干推算（五虎遁月法）
  const yearGanIdx = TIAN_GAN.indexOf(yearGan);
  const monthStartGanIdx = [2, 4, 6, 8, 0][Math.floor(yearGanIdx / 2)]; // 甲己起丙寅
  const mingGan = TIAN_GAN[(monthStartGanIdx + (DI_ZHI.indexOf(mingZhi) - 2 + 12) % 12) % 10];

  return {
    pillars,
    dayMaster: dayGan,
    dayMasterWuxing: WU_XING_MAP[dayGan] || '',
    dayMasterYinYang: GAN_YIN_YANG[dayGan] || '阳',
    shengXiao: useLiChun
      ? eightChar.getYearZhi() // 立春后的地支对应生肖
        ? SHENG_XIAO[DI_ZHI.indexOf(useLiChun ? eightChar.getYearZhi() : yearZhi)]
        : lunar.getYearShengXiao()
      : lunar.getYearShengXiao(),
    wuxingAnalysis,
    solarDate: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    lunarDate: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    taiYuan: taiYuanGan + taiYuanZhi,
    mingGong: mingGan + mingZhi,
  };
}

/**
 * 五行平衡分析
 *
 * 统计四柱八字中各五行出现次数（天干4 + 地支4 = 8字），
 * 判断缺失、偏旺，并评估日主强弱。
 *
 * 日主强弱粗略评估：
 * - 统计"同我"（比劫）+ "生我"（印星）的数量
 * - >= 5 偏强，<= 2 偏弱，其余中和
 */
function computeWuxingAnalysis(pillars: BaziPillar[], dayGan: string): WuxingAnalysis {
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const elements = ['木', '火', '土', '金', '水'];

  // 统计天干 + 地支的五行
  for (const p of pillars) {
    if (p.ganWuxing in counts) counts[p.ganWuxing]++;
    if (p.zhiWuxing in counts) counts[p.zhiWuxing]++;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const missing = elements.filter((e) => counts[e] === 0);
  const sorted = [...elements].sort((a, b) => counts[b] - counts[a]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const strongElements = elements.filter((e) => counts[e] >= 3);
  const weakElements = elements.filter((e) => counts[e] === 1);

  // 日主强弱
  const dayWx = WU_XING_MAP[dayGan];
  const dayWxCount = counts[dayWx] || 0;
  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx); // 生我的五行
  const supportCount = dayWxCount + (genMe ? counts[genMe] : 0);

  let dayMasterStrength: '偏强' | '中和' | '偏弱';
  if (supportCount >= 5) dayMasterStrength = '偏强';
  else if (supportCount <= 2) dayMasterStrength = '偏弱';
  else dayMasterStrength = '中和';

  // 生成摘要
  let summary = `日主${dayGan}属${dayWx}（${GAN_YIN_YANG[dayGan]}${dayWx}）`;
  if (missing.length > 0) {
    summary += `，五行缺${missing.join('、')}`;
  } else {
    summary += '，五行俱全';
  }
  if (strongElements.length > 0) {
    summary += `，${strongElements.join('、')}偏旺`;
  }
  summary += `。日主${dayMasterStrength}`;

  // 用神建议
  if (dayMasterStrength === '偏弱') {
    const helpElements = [dayWx, genMe].filter(Boolean);
    summary += `，宜补${helpElements.join('、')}`;
  } else if (dayMasterStrength === '偏强') {
    const drainMe = WX_GENERATES[dayWx]; // 我生
    const controlMe = WX_CONTROLS[dayWx]; // 我克
    const restrainMe = elements.find((e) => WX_CONTROLS[e] === dayWx); // 克我
    const helpElements = [drainMe, controlMe, restrainMe].filter(Boolean);
    summary += `，宜泄耗：${helpElements.join('、')}`;
  }

  return {
    counts,
    total,
    missing,
    strongest,
    weakest: missing.length > 0 ? missing[0] : weakest,
    strongElements,
    weakElements,
    dayMasterStrength,
    summary,
  };
}

// ==================== 大运（Major Cycles）核心计算 ====================

/** 六十甲子纳音表 */
const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

/** 获取干支纳音 */
export function getNaYin(ganZhi: string): string {
  return NAYIN_TABLE[ganZhi] || '';
}

/** 地支六冲 */
export const ZHI_CHONG: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥',
  '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳',
};

/** 地支六合 */
export const ZHI_HE: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '卯': '戌', '辰': '酉', '巳': '申',
  '午': '未', '未': '午', '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅',
};

/** 天干五合 */
export const GAN_WU_HE: Record<string, string> = {
  '甲': '己', '己': '甲', '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙', '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
};

/** 大运单柱数据 */
export interface DaYunItem {
  index: number;
  ganZhi: string;
  gan: string;
  zhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  shiShen: string;
  zhiShiShen: string;
  cangGan: { gan: string; wuxing: string; shiShen: string }[];
  score: number;
  grade: string;
  naYin: string;
}

/** 大运排盘完整结果 */
export interface DaYunResult {
  startAge: number;
  startAgeDesc: string;
  direction: '顺' | '逆';
  daYunList: DaYunItem[];
}

/**
 * 大运评分
 *
 * 基于日主强弱确定用神/忌神五行，
 * 评估大运干支对命局的辅助或损害程度。
 *
 * 评分维度：
 * 1. 天干五行适配（权重最高）
 * 2. 地支五行适配
 * 3. 补缺五行
 * 4. 与原局柱的合冲关系
 */
function scoreDaYun(
  gan: string,
  zhi: string,
  dayGan: string,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
  pillars: BaziPillar[],
  wuxingCounts: Record<string, number>,
): { score: number; grade: string } {
  let score = 2.5; // 基准分：平

  const ganWx = WU_XING_MAP[gan];
  const zhiWx = WU_XING_MAP[zhi];
  const dayWx = WU_XING_MAP[dayGan];
  const elements = ['木', '火', '土', '金', '水'];

  // 生我的五行
  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx);
  // 我生的五行（泄）
  const iGenerate = WX_GENERATES[dayWx];
  // 我克的五行（耗）
  const iControl = WX_CONTROLS[dayWx];
  // 克我的五行（抑）
  const controlsMe = elements.find((e) => WX_CONTROLS[e] === dayWx);

  // 确定用神（favorable）和忌神（unfavorable）五行
  let yongShen: string[] = [];
  let jiShen: string[] = [];

  if (dayMasterStrength === '偏弱') {
    // 弱需生扶：同我 + 生我
    yongShen = [dayWx, genMe].filter(Boolean) as string[];
    jiShen = [iGenerate, iControl, controlsMe].filter(Boolean) as string[];
  } else if (dayMasterStrength === '偏强') {
    // 强需泄耗抑：我生 + 我克 + 克我
    yongShen = [iGenerate, iControl, controlsMe].filter(Boolean) as string[];
    jiShen = [dayWx, genMe].filter(Boolean) as string[];
  }
  // 中和时 yongShen/jiShen 为空，评分偏向中性

  // 1. 天干五行适配 (±0.8)
  if (yongShen.includes(ganWx)) score += 0.8;
  else if (jiShen.includes(ganWx)) score -= 0.6;

  // 2. 地支五行适配 (±0.6)
  if (yongShen.includes(zhiWx)) score += 0.6;
  else if (jiShen.includes(zhiWx)) score -= 0.4;

  // 3. 补缺五行 (+0.3)
  const missing = elements.filter((e) => (wuxingCounts[e] || 0) === 0);
  if (missing.includes(ganWx) || missing.includes(zhiWx)) score += 0.3;

  // 4. 与原局四柱的合冲关系
  for (const p of pillars) {
    // 地支六冲（不利）
    if (ZHI_CHONG[zhi] === p.zhi) score -= 0.2;
    // 地支六合（有利）
    if (ZHI_HE[zhi] === p.zhi) score += 0.15;
    // 天干五合（有利）
    if (GAN_WU_HE[gan] === p.gan) score += 0.1;
  }

  // 限制在 0-5 范围
  score = Math.max(0, Math.min(5, score));

  // 确定等级
  let grade: string;
  if (score >= 4.0) grade = '上吉';
  else if (score >= 3.0) grade = '小吉';
  else if (score >= 2.0) grade = '平';
  else if (score >= 1.0) grade = '小凶';
  else grade = '凶';

  return { score: Math.round(score * 10) / 10, grade };
}

/**
 * 构建大运排盘结果
 *
 * 利用 lunar-javascript 库的 Yun（运）对象计算起运岁数和大运序列，
 * 结合八字原局信息对每步大运进行运势评分。
 *
 * @param year       出生年
 * @param month      出生月
 * @param day        出生日
 * @param hour       出生时辰（小时）
 * @param gender     性别 1=男 0=女
 * @param baziResult 已计算好的八字排盘结果
 * @param options    排盘选项
 */
export function buildDaYunResult(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: number,
  baziResult: BaziResult,
  options: BaziOptions = {},
): DaYunResult {
  const { isLunar = false, isLeapMonth = false, sect = 2 } = options;

  // 重建日期对象以获取 EightChar 和 Yun
  let solar;
  if (isLunar) {
    const actualMonth = isLeapMonth ? -Math.abs(month) : month;
    const lunarTemp = Lunar.fromYmd(year, actualMonth, day);
    const solarTemp = lunarTemp.getSolar();
    solar = Solar.fromYmdHms(
      solarTemp.getYear(), solarTemp.getMonth(), solarTemp.getDay(), hour, 0, 0,
    );
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  }

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(sect);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yun: any = eightChar.getYun(gender);

  const startYearNum: number = yun.getStartYear();
  const startMonth: number = yun.getStartMonth();
  const startDay: number = yun.getStartDay();

  // 构造起运描述
  let startAgeDesc = `${startYearNum}岁`;
  if (startMonth > 0) startAgeDesc += `${startMonth}个月`;
  if (startDay > 0) startAgeDesc += `${startDay}天`;

  const direction: '顺' | '逆' = yun.isForward() ? '顺' : '逆';

  // 获取大运数组（index 0 = 出生到起运的过渡期，1-8 = 八步大运）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const daYunArr: any[] = yun.getDaYun(9);

  const dayGan = baziResult.dayMaster;
  const daYunList: DaYunItem[] = [];

  for (let i = 1; i < daYunArr.length; i++) {
    const dy = daYunArr[i];
    const ganZhi: string = dy.getGanZhi();
    if (!ganZhi) continue;

    const gan = ganZhi[0];
    const zhi = ganZhi[1];

    const cangGan = (ZHI_CANG_GAN[zhi] || []).map((g: string) => ({
      gan: g,
      wuxing: WU_XING_MAP[g] || '',
      shiShen: getShiShen(dayGan, g),
    }));

    const { score, grade } = scoreDaYun(
      gan, zhi, dayGan,
      baziResult.wuxingAnalysis.dayMasterStrength,
      baziResult.pillars,
      baziResult.wuxingAnalysis.counts,
    );

    daYunList.push({
      index: i - 1,
      ganZhi,
      gan,
      zhi,
      ganWuxing: WU_XING_MAP[gan] || '',
      zhiWuxing: WU_XING_MAP[zhi] || '',
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      startYear: dy.getStartYear(),
      endYear: dy.getEndYear(),
      shiShen: getShiShen(dayGan, gan),
      zhiShiShen: cangGan.length > 0 ? cangGan[0].shiShen : '',
      cangGan,
      score,
      grade,
      naYin: NAYIN_TABLE[ganZhi] || '',
    });
  }

  return {
    startAge: startYearNum,
    startAgeDesc,
    direction,
    daYunList,
  };
}

// ==================== 流年（Annual Cycles）核心计算 ====================

/**
 * 获取指定公历年份的干支
 *
 * 基于六十甲子循环：甲子年 = 公元4年起算
 * 注意：此为简化计算，年界以公历1月1日为准（非立春），
 * 用于流年运势展示足够精确。
 */
export function getYearGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/** 流年单年数据 */
export interface LiuNianItem {
  year: number;
  age: number;
  ganZhi: string;
  gan: string;
  zhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  shiShen: string;
  score: number;
  grade: string;
  naYin: string;
  relations: string[];
}

/**
 * 检测流年干支与大运/原局的合冲关系
 *
 * 检测维度：
 * - 流年天干 vs 大运天干（天干五合）
 * - 流年地支 vs 大运地支（六冲、六合）
 * - 流年天干 vs 原局各柱天干（天干五合）
 * - 流年地支 vs 原局各柱地支（六冲、六合）
 */
function detectRelations(
  gan: string,
  zhi: string,
  daYunGan: string,
  daYunZhi: string,
  pillars: BaziPillar[],
): string[] {
  const relations: string[] = [];
  const pillarNames = ['年', '月', '日', '时'];

  // 流年天干 vs 大运天干
  if (GAN_WU_HE[gan] === daYunGan) {
    relations.push(`${gan}${daYunGan}合·运`);
  }

  // 流年地支 vs 大运地支
  if (ZHI_CHONG[zhi] === daYunZhi) {
    relations.push(`${zhi}${daYunZhi}冲·运`);
  }
  if (ZHI_HE[zhi] === daYunZhi) {
    relations.push(`${zhi}${daYunZhi}合·运`);
  }

  // 流年 vs 原局四柱
  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    if (GAN_WU_HE[gan] === p.gan) {
      relations.push(`${gan}${p.gan}合·${pillarNames[i]}`);
    }
    if (ZHI_CHONG[zhi] === p.zhi) {
      relations.push(`${zhi}${p.zhi}冲·${pillarNames[i]}`);
    }
    if (ZHI_HE[zhi] === p.zhi) {
      relations.push(`${zhi}${p.zhi}合·${pillarNames[i]}`);
    }
  }

  return relations;
}

/**
 * 流年评分
 *
 * 评估流年干支对命局的影响，综合考虑：
 * 1. 用神/忌神五行适配
 * 2. 补缺五行
 * 3. 与大运和原局的合冲关系
 */
function scoreLiuNian(
  gan: string,
  zhi: string,
  dayGan: string,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
  pillars: BaziPillar[],
  wuxingCounts: Record<string, number>,
  daYunGan: string,
  daYunZhi: string,
): { score: number; grade: string; relations: string[] } {
  let score = 2.5;

  const ganWx = WU_XING_MAP[gan];
  const zhiWx = WU_XING_MAP[zhi];
  const dayWx = WU_XING_MAP[dayGan];
  const elements = ['木', '火', '土', '金', '水'];

  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx);
  const iGenerate = WX_GENERATES[dayWx];
  const iControl = WX_CONTROLS[dayWx];
  const controlsMe = elements.find((e) => WX_CONTROLS[e] === dayWx);

  let yongShen: string[] = [];
  let jiShen: string[] = [];

  if (dayMasterStrength === '偏弱') {
    yongShen = [dayWx, genMe].filter(Boolean) as string[];
    jiShen = [iGenerate, iControl, controlsMe].filter(Boolean) as string[];
  } else if (dayMasterStrength === '偏强') {
    yongShen = [iGenerate, iControl, controlsMe].filter(Boolean) as string[];
    jiShen = [dayWx, genMe].filter(Boolean) as string[];
  }

  // 1. 天干五行适配 (±0.7)
  if (yongShen.includes(ganWx)) score += 0.7;
  else if (jiShen.includes(ganWx)) score -= 0.5;

  // 2. 地支五行适配 (±0.5)
  if (yongShen.includes(zhiWx)) score += 0.5;
  else if (jiShen.includes(zhiWx)) score -= 0.35;

  // 3. 补缺五行 (+0.2)
  const missing = elements.filter((e) => (wuxingCounts[e] || 0) === 0);
  if (missing.includes(ganWx) || missing.includes(zhiWx)) score += 0.2;

  // 4. 关系检测及评分影响
  const relations = detectRelations(gan, zhi, daYunGan, daYunZhi, pillars);

  for (const rel of relations) {
    if (rel.includes('冲')) score -= 0.15;
    else if (rel.includes('合')) score += 0.1;
  }

  score = Math.max(0, Math.min(5, score));

  let grade: string;
  if (score >= 4.0) grade = '上吉';
  else if (score >= 3.0) grade = '小吉';
  else if (score >= 2.0) grade = '平';
  else if (score >= 1.0) grade = '小凶';
  else grade = '凶';

  return { score: Math.round(score * 10) / 10, grade, relations };
}

/**
 * 构建指定大运的流年列表
 *
 * 遍历大运年份范围内的每一年，计算干支、十神、评分和关系。
 */
export function buildLiuNianList(
  daYun: DaYunItem,
  baziResult: BaziResult,
): LiuNianItem[] {
  const dayGan = baziResult.dayMaster;
  const list: LiuNianItem[] = [];

  for (let year = daYun.startYear; year <= daYun.endYear; year++) {
    const ganZhi = getYearGanZhi(year);
    const gan = ganZhi[0];
    const zhi = ganZhi[1];
    const age = daYun.startAge + (year - daYun.startYear);

    const { score, grade, relations } = scoreLiuNian(
      gan, zhi, dayGan,
      baziResult.wuxingAnalysis.dayMasterStrength,
      baziResult.pillars,
      baziResult.wuxingAnalysis.counts,
      daYun.gan, daYun.zhi,
    );

    list.push({
      year,
      age,
      ganZhi,
      gan,
      zhi,
      ganWuxing: WU_XING_MAP[gan] || '',
      zhiWuxing: WU_XING_MAP[zhi] || '',
      shiShen: getShiShen(dayGan, gan),
      score,
      grade,
      naYin: NAYIN_TABLE[ganZhi] || '',
      relations,
    });
  }

  return list;
}

// ==================== 四维分析（Four-Dimension Analysis） ====================

/** 五行与脏腑对照 */
const WX_ORGAN: Record<string, string> = {
  '木': '肝胆', '火': '心脏', '土': '脾胃', '金': '肺部', '水': '肾脏',
};

/** 十神含义标签 */
const SHISHEN_MEANING: Record<string, { career: string; wealth: string; marriage_m: string; marriage_f: string }> = {
  '比肩': { career: '竞争同行', wealth: '分财争利', marriage_m: '争妻', marriage_f: '争夫' },
  '劫财': { career: '合作竞争', wealth: '破财耗散', marriage_m: '夺妻', marriage_f: '克夫' },
  '食神': { career: '才华表现', wealth: '生财有道', marriage_m: '女儿缘', marriage_f: '子女缘' },
  '伤官': { career: '叛逆创新', wealth: '投机生财', marriage_m: '克子', marriage_f: '克夫' },
  '偏财': { career: '外财商机', wealth: '意外横财', marriage_m: '多情', marriage_f: '父亲缘' },
  '正财': { career: '稳定薪资', wealth: '正当收入', marriage_m: '妻缘', marriage_f: '父亲缘' },
  '七杀': { career: '权威压力', wealth: '险中求财', marriage_m: '小人', marriage_f: '夫缘' },
  '正官': { career: '正规升迁', wealth: '稳健保守', marriage_m: '贵人', marriage_f: '夫缘' },
  '偏印': { career: '偏门学术', wealth: '不劳而获', marriage_m: '母亲缘', marriage_f: '克子' },
  '正印': { career: '学业贵人', wealth: '遇困有助', marriage_m: '母亲缘', marriage_f: '保护' },
};

/** 单维度分析结果 */
export interface DimensionResult {
  label: string;
  icon: string;
  score: number;
  grade: string;
  summary: string;
  keywords: string[];
}

/** 四维分析完整结果 */
export interface FourDimensionAnalysis {
  career: DimensionResult;
  wealth: DimensionResult;
  marriage: DimensionResult;
  health: DimensionResult;
}

function dimensionGrade(score: number): string {
  if (score >= 85) return '上吉';
  if (score >= 70) return '吉';
  if (score >= 55) return '中';
  if (score >= 40) return '平';
  return '不利';
}

/**
 * 四维命局分析
 *
 * 基于八字原局的十神分布、五行平衡和日主强弱，
 * 从事业、财运、婚姻、健康四个维度进行评估。
 */
export function analyzeFourDimensions(
  baziResult: BaziResult,
  gender: number, // 1=男, 0=女
): FourDimensionAnalysis {
  const { pillars, dayMaster, wuxingAnalysis } = baziResult;
  const { dayMasterStrength, counts, missing } = wuxingAnalysis;
  const dayWx = WU_XING_MAP[dayMaster];

  // 统计十神分布
  const shiShenCounts: Record<string, number> = {};
  for (const p of pillars) {
    if (p.shiShen && p.shiShen !== '日主') {
      shiShenCounts[p.shiShen] = (shiShenCounts[p.shiShen] || 0) + 1;
    }
    for (const cg of p.cangGan) {
      if (cg.shiShen && cg.shiShen !== '日主') {
        shiShenCounts[cg.shiShen] = (shiShenCounts[cg.shiShen] || 0) + 0.5;
      }
    }
  }

  // ---- 事业分析 ----
  const careerScore = analyzeCareer(shiShenCounts, dayMasterStrength);

  // ---- 财运分析 ----
  const wealthScore = analyzeWealth(shiShenCounts, dayMasterStrength);

  // ---- 婚姻分析 ----
  const marriageScore = analyzeMarriage(shiShenCounts, dayMasterStrength, pillars, gender);

  // ---- 健康分析 ----
  const healthScore = analyzeHealth(counts, missing, dayWx, dayMasterStrength);

  return {
    career: careerScore,
    wealth: wealthScore,
    marriage: marriageScore,
    health: healthScore,
  };
}

function analyzeCareer(
  shiShenCounts: Record<string, number>,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
): DimensionResult {
  let score = 60;
  const keywords: string[] = [];

  const guan = (shiShenCounts['正官'] || 0) + (shiShenCounts['七杀'] || 0);
  const yin = (shiShenCounts['正印'] || 0) + (shiShenCounts['偏印'] || 0);
  const shi = (shiShenCounts['食神'] || 0) + (shiShenCounts['伤官'] || 0);

  // 官杀适度有利事业
  if (guan >= 1 && guan <= 2) {
    score += 15;
    keywords.push('官星得力');
  } else if (guan >= 3) {
    score -= 5;
    keywords.push('官杀混杂');
  } else {
    score -= 5;
    keywords.push('官星不显');
  }

  // 印星辅助
  if (yin >= 1) {
    score += 10;
    keywords.push('印星扶持');
  }

  // 食伤与事业
  if (shi >= 1 && shi <= 2) {
    score += 5;
    keywords.push('才华外露');
  } else if (shi >= 3) {
    score -= 5;
    keywords.push('伤官过旺');
  }

  // 日主强弱影响
  if (dayMasterStrength === '中和') {
    score += 10;
    keywords.push('身旺适中');
  } else if (dayMasterStrength === '偏强' && guan >= 1) {
    score += 5;
    keywords.push('身强任官');
  } else if (dayMasterStrength === '偏弱' && guan >= 2) {
    score -= 10;
    keywords.push('身弱官重');
  }

  score = Math.max(20, Math.min(95, score));

  let summary = '';
  if (score >= 70) {
    summary = '事业运势良好，有贵人相助，适合稳步发展。';
    if (keywords.includes('身强任官')) summary += '身强能任官，宜争取领导机会。';
  } else if (score >= 55) {
    summary = '事业运势平稳，需要自身努力，注意人际关系。';
  } else {
    summary = '事业运势有波折，宜低调行事，积累实力。';
    if (keywords.includes('身弱官重')) summary += '压力较大，注意身心健康。';
  }

  return { label: '事业', icon: '💼', score, grade: dimensionGrade(score), summary, keywords };
}

function analyzeWealth(
  shiShenCounts: Record<string, number>,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
): DimensionResult {
  let score = 60;
  const keywords: string[] = [];

  const cai = (shiShenCounts['正财'] || 0) + (shiShenCounts['偏财'] || 0);
  const jie = (shiShenCounts['比肩'] || 0) + (shiShenCounts['劫财'] || 0);
  const shi = (shiShenCounts['食神'] || 0) + (shiShenCounts['伤官'] || 0);

  // 财星存在
  if (cai >= 1 && cai <= 2) {
    score += 15;
    keywords.push('财星适中');
  } else if (cai >= 3) {
    if (dayMasterStrength === '偏强') {
      score += 10;
      keywords.push('财多身强');
    } else {
      score -= 5;
      keywords.push('财多身弱');
    }
  } else {
    score -= 10;
    keywords.push('财星不显');
  }

  // 食伤生财
  if (shi >= 1 && cai >= 1) {
    score += 10;
    keywords.push('食伤生财');
  }

  // 比劫争财
  if (jie >= 2 && cai >= 1) {
    score -= 8;
    keywords.push('比劫争财');
  }

  // 日主强弱影响
  if (dayMasterStrength === '偏强' && cai >= 1) {
    score += 8;
    keywords.push('身强担财');
  } else if (dayMasterStrength === '偏弱' && cai >= 2) {
    score -= 8;
    keywords.push('身弱财重');
  }

  score = Math.max(20, Math.min(95, score));

  let summary = '';
  if (score >= 70) {
    summary = '财运较好，有正当收入来源，理财能力较强。';
    if (keywords.includes('食伤生财')) summary += '才华可转化为财富。';
  } else if (score >= 55) {
    summary = '财运平稳，收入稳定但不宜冒进，量入为出。';
  } else {
    summary = '财运有阻，需谨慎理财，避免大额投资。';
    if (keywords.includes('比劫争财')) summary += '注意合作中的利益分配。';
  }

  return { label: '财运', icon: '💰', score, grade: dimensionGrade(score), summary, keywords };
}

function analyzeMarriage(
  shiShenCounts: Record<string, number>,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
  pillars: BaziPillar[],
  gender: number,
): DimensionResult {
  let score = 60;
  const keywords: string[] = [];

  // 配偶星：男看正财，女看正官
  const spouseStar = gender === 1 ? '正财' : '正官';
  const rivalStar = gender === 1 ? '偏财' : '七杀';
  const spouseCount = shiShenCounts[spouseStar] || 0;
  const rivalCount = shiShenCounts[rivalStar] || 0;

  // 配偶星适度为吉
  if (spouseCount >= 1 && spouseCount <= 1.5) {
    score += 15;
    keywords.push(`${spouseStar}得力`);
  } else if (spouseCount >= 2) {
    score -= 5;
    keywords.push(`${spouseStar}过多`);
  } else {
    score -= 8;
    keywords.push(`${spouseStar}不显`);
  }

  // 竞争星过多
  if (rivalCount >= 2) {
    score -= 8;
    keywords.push('桃花旺');
  }

  // 日支为配偶宫，检查冲合
  const dayZhi = pillars[2].zhi;
  for (let i = 0; i < pillars.length; i++) {
    if (i === 2) continue;
    if (ZHI_CHONG[dayZhi] === pillars[i].zhi) {
      score -= 8;
      keywords.push('日支逢冲');
      break;
    }
  }
  for (let i = 0; i < pillars.length; i++) {
    if (i === 2) continue;
    if (ZHI_HE[dayZhi] === pillars[i].zhi) {
      score += 5;
      keywords.push('日支逢合');
      break;
    }
  }

  // 日主强弱影响
  if (dayMasterStrength === '中和') {
    score += 8;
    keywords.push('身旺中和');
  }

  // 伤官对婚姻不利（尤其女命）
  if (gender === 0 && (shiShenCounts['伤官'] || 0) >= 1.5) {
    score -= 10;
    keywords.push('伤官克夫');
  }
  if (gender === 1 && (shiShenCounts['劫财'] || 0) >= 1.5) {
    score -= 8;
    keywords.push('劫财争妻');
  }

  score = Math.max(20, Math.min(95, score));

  let summary = '';
  if (score >= 70) {
    summary = '婚姻缘分较好，感情稳定，夫妻和睦。';
  } else if (score >= 55) {
    summary = '婚姻运势平稳，需要相互经营，多加沟通。';
    if (keywords.includes('日支逢冲')) summary += '注意避免因小事引起争执。';
  } else {
    summary = '婚姻运势有波折，宜晚婚，注意感情维护。';
    if (keywords.includes('伤官克夫')) summary += '性格较强，宜包容理解。';
  }

  return { label: '婚姻', icon: '💑', score, grade: dimensionGrade(score), summary, keywords };
}

function analyzeHealth(
  counts: Record<string, number>,
  missingElements: string[],
  dayWx: string,
  dayMasterStrength: '偏强' | '中和' | '偏弱',
): DimensionResult {
  let score = 70;
  const keywords: string[] = [];

  // 五行缺失影响健康
  for (const el of missingElements) {
    score -= 10;
    keywords.push(`缺${el}防${WX_ORGAN[el]}`);
  }

  // 五行过旺也影响
  const elements = ['木', '火', '土', '金', '水'];
  for (const el of elements) {
    if ((counts[el] || 0) >= 4) {
      score -= 8;
      keywords.push(`${el}过旺注意${WX_ORGAN[el]}`);
    }
  }

  // 五行俱全
  if (missingElements.length === 0) {
    score += 10;
    keywords.push('五行俱全');
  }

  // 日主强弱
  if (dayMasterStrength === '中和') {
    score += 8;
    keywords.push('身体根基好');
  } else if (dayMasterStrength === '偏弱') {
    score -= 5;
    keywords.push('体质偏弱');
  }

  score = Math.max(20, Math.min(95, score));

  let summary = '';
  if (score >= 70) {
    summary = '健康运势较好，体质较佳。';
    if (keywords.includes('五行俱全')) summary += '五行均衡，根基稳固。';
  } else if (score >= 55) {
    summary = '健康总体尚可，需注意养生。';
  } else {
    summary = '健康需多加注意，建议定期体检。';
  }
  // 追加脏腑提醒
  const organWarnings = keywords.filter(k => k.includes('防') || k.includes('注意'));
  if (organWarnings.length > 0) {
    summary += `重点关注：${organWarnings.join('；')}。`;
  }

  return { label: '健康', icon: '🏥', score, grade: dimensionGrade(score), summary, keywords };
}

// ==================== 动态五行力量 ====================

/** 动态五行数据 */
export interface DynamicWuxingData {
  /** 原局五行力量值（带藏干加权） */
  original: Record<string, number>;
  /** 叠加大运后的五行力量 */
  withDaYun: Record<string, number>;
  /** 叠加大运+流年后的五行力量 */
  withLiuNian: Record<string, number>;
}

/**
 * 计算动态五行力量分布
 *
 * 原局权重：天干=1.0，地支=0.8，藏干本气=0.5，中气=0.3，余气=0.15
 * 大运权重：天干=0.6，地支=0.4
 * 流年权重：天干=0.4，地支=0.3
 */
export function computeDynamicWuxing(
  baziResult: BaziResult,
  daYun?: DaYunItem | null,
  liuNian?: LiuNianItem | null,
): DynamicWuxingData {
  const elements = ['木', '火', '土', '金', '水'];
  const original: Record<string, number> = {};
  const withDaYun: Record<string, number> = {};
  const withLiuNian: Record<string, number> = {};

  // 初始化
  for (const e of elements) {
    original[e] = 0;
    withDaYun[e] = 0;
    withLiuNian[e] = 0;
  }

  // 原局计算：天干1.0 + 地支0.8 + 藏干(0.5/0.3/0.15)
  for (const p of baziResult.pillars) {
    if (p.ganWuxing) original[p.ganWuxing] = (original[p.ganWuxing] || 0) + 1.0;
    if (p.zhiWuxing) original[p.zhiWuxing] = (original[p.zhiWuxing] || 0) + 0.8;
    p.cangGan.forEach((cg, idx) => {
      const weight = idx === 0 ? 0.5 : idx === 1 ? 0.3 : 0.15;
      if (cg.wuxing) original[cg.wuxing] = (original[cg.wuxing] || 0) + weight;
    });
  }

  // 复制原局到大运层
  for (const e of elements) withDaYun[e] = original[e];

  // 叠加大运
  if (daYun) {
    if (daYun.ganWuxing) withDaYun[daYun.ganWuxing] += 0.6;
    if (daYun.zhiWuxing) withDaYun[daYun.zhiWuxing] += 0.4;
  }

  // 复制到流年层
  for (const e of elements) withLiuNian[e] = withDaYun[e];

  // 叠加流年
  if (liuNian) {
    if (liuNian.ganWuxing) withLiuNian[liuNian.ganWuxing] += 0.4;
    if (liuNian.zhiWuxing) withLiuNian[liuNian.zhiWuxing] += 0.3;
  }

  return { original, withDaYun, withLiuNian };
}

// ==================== 流年联动分析（LiuNian Detail Analysis） ====================

/** 五行互动关系类型 */
type WxRelation = '相生' | '相克' | '同类' | '被生' | '被克';

/** 获取两个五行之间的关系（以 source 为主体视角） */
function getWxRelation(source: string, target: string): WxRelation {
  if (source === target) return '同类';
  if (WX_GENERATES[source] === target) return '相生';  // 我生他
  if (WX_CONTROLS[source] === target) return '相克';    // 我克他
  if (WX_GENERATES[target] === source) return '被生';   // 他生我
  if (WX_CONTROLS[target] === source) return '被克';    // 他克我
  return '同类';
}

/** 五行关系对人的描述 */
function wxRelationDesc(rel: WxRelation, sourceLabel: string, targetLabel: string, sourceWx: string, targetWx: string): string {
  const map: Record<WxRelation, string> = {
    '相生': `${sourceLabel}${sourceWx}生${targetLabel}${targetWx}，有助力`,
    '相克': `${sourceLabel}${sourceWx}克${targetLabel}${targetWx}，有制约`,
    '同类': `${sourceLabel}${targetLabel}同为${sourceWx}，力量加强`,
    '被生': `${targetLabel}${targetWx}生${sourceLabel}${sourceWx}，受益`,
    '被克': `${targetLabel}${targetWx}克${sourceLabel}${sourceWx}，受压`,
  };
  return map[rel];
}

/** 合冲影响维度映射 */
function getRelImpactDimension(rel: string): string {
  if (rel.includes('·年')) return '家庭/长辈';
  if (rel.includes('·月')) return '事业/工作';
  if (rel.includes('·日')) return '自身/婚姻';
  if (rel.includes('·时')) return '子女/下属';
  if (rel.includes('·运')) return '整体运势';
  return '综合';
}

/** 十神对应的流年影响主题 */
const SHISHEN_LIUNIAN_THEME: Record<string, { career: string; wealth: string; marriage: string; health: string }> = {
  '比肩': { career: '竞争加剧，需巩固自身优势', wealth: '不宜合伙，防分财之象', marriage: '感情平淡，各忙各的', health: '精力旺盛，但防冲动受伤' },
  '劫财': { career: '社交活跃，但防被人抢功', wealth: '破财风险增大，管好钱包', marriage: '异性缘增多，但有争端', health: '注意控制脾气，防意外' },
  '食神': { career: '创意爆发，适合展示才华', wealth: '才华变现好时机', marriage: '感情甜蜜，生活惬意', health: '胃口好，注意饮食节制' },
  '伤官': { career: '敢于突破，但易得罪人', wealth: '投机收益与风险并存', marriage: '口舌是非较多，宜忍让', health: '注意口腔和消化系统' },
  '正财': { career: '工作稳定，有加薪机会', wealth: '正财入库，收入增加', marriage: '男命利婚姻，感情稳定', health: '身体消耗较大，注意休息' },
  '偏财': { career: '有意外机遇，宜把握商机', wealth: '意外之财可期，但勿贪', marriage: '社交桃花旺，注意分寸', health: '应酬增多，注意肝胃' },
  '正官': { career: '有升迁机会，贵人提携', wealth: '收入稳中有升', marriage: '女命利婚姻，有正缘', health: '压力增大，注意心血管' },
  '七杀': { career: '压力与机遇并存，考验期', wealth: '财运波动，险中求财', marriage: '感情有波折，需要磨合', health: '精神压力大，注意睡眠' },
  '正印': { career: '贵人相助，学业/职称有利', wealth: '不宜冒进，稳守为主', marriage: '感情平和，家庭温馨', health: '身体恢复期，利养生' },
  '偏印': { career: '适合钻研技术，不宜社交', wealth: '财运平淡，不宜投资', marriage: '感情有冷淡倾向，需经营', health: '注意消化系统和情绪' },
};

/** 流年联动分析-原局关系 */
export interface LiuNianYuanJuRelation {
  pillarLabel: string;
  pillarGanZhi: string;
  ganRelation: string;
  zhiRelation: string;
  clashOrHarmony: string[];
  impactDimension: string;
}

/** 流年联动分析-大运互动 */
export interface LiuNianDaYunInteraction {
  ganInteraction: string;
  zhiInteraction: string;
  overallTendency: string;
  tendencyType: 'positive' | 'negative' | 'neutral';
}

/** 流年核心断语 */
export interface LiuNianVerdict {
  dimension: string;
  icon: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

/** 流年关键提示 */
export interface LiuNianTip {
  text: string;
  type: 'risk' | 'opportunity';
}

/** 流年联动分析完整结果 */
export interface LiuNianAnalysis {
  /** 基础信息 */
  year: number;
  ganZhi: string;
  gan: string;
  zhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  shiShen: string;
  zhiShiShen: string;
  naYin: string;
  score: number;
  grade: string;
  /** 原局联动 */
  yuanJuRelations: LiuNianYuanJuRelation[];
  yuanJuSummary: string;
  /** 大运联动 */
  daYunInteraction: LiuNianDaYunInteraction;
  /** 核心断语（事业/财运/感情/健康） */
  verdicts: LiuNianVerdict[];
  /** 关键提示 */
  tips: LiuNianTip[];
}

/**
 * 流年联动分析
 *
 * 综合「八字原局 + 当前大运 + 流年干支」进行深度分析：
 * 1. 计算流年与原局四柱的五行生克 + 合冲关系
 * 2. 计算流年与大运的五行互动和吉凶倾向
 * 3. 基于十神作用 + 日主喜忌，输出四维度断语
 * 4. 汇总需注意的风险和可把握的机会
 */
export function getLiuNianAnalysis(
  baziResult: BaziResult,
  daYun: DaYunItem,
  liuNian: LiuNianItem,
): LiuNianAnalysis {
  const { pillars, dayMaster, wuxingAnalysis } = baziResult;
  const { dayMasterStrength, missing, counts } = wuxingAnalysis;
  const dayWx = WU_XING_MAP[dayMaster];
  const lnGanWx = liuNian.ganWuxing;
  const lnZhiWx = liuNian.zhiWuxing;
  const elements = ['木', '火', '土', '金', '水'];

  // --- 流年地支藏干主气十神 ---
  const zhiCangGanList = ZHI_CANG_GAN[liuNian.zhi] || [];
  const zhiShiShen = zhiCangGanList.length > 0 ? getShiShen(dayMaster, zhiCangGanList[0]) : '';

  // --- 1. 原局联动分析 ---
  const pillarLabels = ['年柱', '月柱', '日柱', '时柱'];
  const yuanJuRelations: LiuNianYuanJuRelation[] = [];

  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    const ganRel = getWxRelation(lnGanWx, p.ganWuxing);
    const zhiRel = getWxRelation(lnZhiWx, p.zhiWuxing);

    const clashOrHarmony: string[] = [];
    if (GAN_WU_HE[liuNian.gan] === p.gan) clashOrHarmony.push(`${liuNian.gan}${p.gan}天干合`);
    if (ZHI_CHONG[liuNian.zhi] === p.zhi) clashOrHarmony.push(`${liuNian.zhi}${p.zhi}地支冲`);
    if (ZHI_HE[liuNian.zhi] === p.zhi) clashOrHarmony.push(`${liuNian.zhi}${p.zhi}地支合`);

    const impactParts: string[] = [];
    for (const ch of clashOrHarmony) {
      const fullRel = ch + (i === 0 ? '·年' : i === 1 ? '·月' : i === 2 ? '·日' : '·时');
      impactParts.push(getRelImpactDimension(fullRel));
    }

    yuanJuRelations.push({
      pillarLabel: pillarLabels[i],
      pillarGanZhi: p.ganZhi,
      ganRelation: wxRelationDesc(ganRel, '流年', pillarLabels[i], lnGanWx, p.ganWuxing),
      zhiRelation: wxRelationDesc(zhiRel, '流年', pillarLabels[i], lnZhiWx, p.zhiWuxing),
      clashOrHarmony,
      impactDimension: impactParts.length > 0 ? impactParts.join('、') : '无明显冲合',
    });
  }

  // 原局总结
  const allClash = yuanJuRelations.flatMap((r) => r.clashOrHarmony);
  const hasChong = allClash.some((c) => c.includes('冲'));
  const hasHe = allClash.some((c) => c.includes('合'));
  const lnSupplies = missing.filter((m) => m === lnGanWx || m === lnZhiWx);

  let yuanJuSummary = `流年${liuNian.ganZhi}（${lnGanWx}${lnZhiWx}），十神${liuNian.shiShen}。`;
  if (lnSupplies.length > 0) {
    yuanJuSummary += `补原局所缺${lnSupplies.join('、')}，有利。`;
  }
  if (hasChong && hasHe) {
    yuanJuSummary += '与原局有冲有合，变动中有转机。';
  } else if (hasChong) {
    yuanJuSummary += '与原局有冲，此年变动较大，需沉稳应对。';
  } else if (hasHe) {
    yuanJuSummary += '与原局有合，人际和谐，有贵人缘。';
  } else {
    yuanJuSummary += '与原局无明显冲合，运势相对平稳。';
  }

  // --- 2. 大运联动分析 ---
  const dyGanWx = daYun.ganWuxing;
  const dyZhiWx = daYun.zhiWuxing;
  const ganRel = getWxRelation(lnGanWx, dyGanWx);
  const zhiRel = getWxRelation(lnZhiWx, dyZhiWx);

  const ganDesc = wxRelationDesc(ganRel, '流年', '大运', lnGanWx, dyGanWx);
  const zhiDesc = wxRelationDesc(zhiRel, '流年', '大运', lnZhiWx, dyZhiWx);

  // 大运冲合检测
  const dyClash: string[] = [];
  if (GAN_WU_HE[liuNian.gan] === daYun.gan) dyClash.push('天干合');
  if (ZHI_CHONG[liuNian.zhi] === daYun.zhi) dyClash.push('地支冲');
  if (ZHI_HE[liuNian.zhi] === daYun.zhi) dyClash.push('地支合');

  // 用神判断
  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx);
  const iGen = WX_GENERATES[dayWx];
  const iCtrl = WX_CONTROLS[dayWx];
  const ctrlMe = elements.find((e) => WX_CONTROLS[e] === dayWx);

  let yongShen: string[] = [];
  let jiShen: string[] = [];
  if (dayMasterStrength === '偏弱') {
    yongShen = [dayWx, genMe].filter(Boolean) as string[];
    jiShen = [iGen, iCtrl, ctrlMe].filter(Boolean) as string[];
  } else if (dayMasterStrength === '偏强') {
    yongShen = [iGen, iCtrl, ctrlMe].filter(Boolean) as string[];
    jiShen = [dayWx, genMe].filter(Boolean) as string[];
  } else {
    yongShen = [iGen, dayWx].filter(Boolean) as string[];
  }

  // 计算流年+大运五行组合对日主的利弊
  const lnFavorable = yongShen.includes(lnGanWx) || yongShen.includes(lnZhiWx);
  const lnUnfavorable = jiShen.includes(lnGanWx) || jiShen.includes(lnZhiWx);
  const dyFavorable = yongShen.includes(dyGanWx) || yongShen.includes(dyZhiWx);

  let overallTendency = '';
  let tendencyType: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (lnFavorable && dyFavorable) {
    overallTendency = '流年大运五行皆合用神，运势上行';
    tendencyType = 'positive';
  } else if (lnFavorable && !dyFavorable) {
    overallTendency = '流年引入用神五行，缓解大运不利';
    tendencyType = 'positive';
  } else if (lnUnfavorable && dyFavorable) {
    overallTendency = '流年带入忌神五行，大运底子好仍可支撑';
    tendencyType = 'neutral';
  } else if (lnUnfavorable && !dyFavorable) {
    overallTendency = '流年大运五行皆非用神，需谨慎行事';
    tendencyType = 'negative';
  } else {
    overallTendency = '流年大运五行中性，运势平稳';
    tendencyType = 'neutral';
  }

  if (dyClash.length > 0) {
    overallTendency += `（流年与大运${dyClash.join('、')}）`;
  }

  const daYunInteraction: LiuNianDaYunInteraction = {
    ganInteraction: ganDesc,
    zhiInteraction: zhiDesc,
    overallTendency,
    tendencyType,
  };

  // --- 3. 核心断语（四维度） ---
  const theme = SHISHEN_LIUNIAN_THEME[liuNian.shiShen] || SHISHEN_LIUNIAN_THEME['比肩'];

  const verdicts: LiuNianVerdict[] = [];

  // 事业
  const careerPositive = ['正官', '正印', '七杀'].includes(liuNian.shiShen) && (lnFavorable || liuNian.score >= 3.0);
  verdicts.push({
    dimension: '事业',
    icon: '💼',
    text: theme.career,
    type: careerPositive ? 'positive' : (['比肩', '劫财', '伤官'].includes(liuNian.shiShen) && liuNian.score < 2.5) ? 'negative' : 'neutral',
  });

  // 财运
  const wealthPositive = ['正财', '偏财', '食神'].includes(liuNian.shiShen) && (dayMasterStrength !== '偏弱' || liuNian.score >= 3.0);
  verdicts.push({
    dimension: '财运',
    icon: '💰',
    text: theme.wealth,
    type: wealthPositive ? 'positive' : (['劫财', '比肩'].includes(liuNian.shiShen) || (liuNian.score < 2.0)) ? 'negative' : 'neutral',
  });

  // 感情
  const marriagePositive = (['正财', '正官'].includes(liuNian.shiShen) && liuNian.score >= 2.5);
  verdicts.push({
    dimension: '感情',
    icon: '💑',
    text: theme.marriage,
    type: marriagePositive ? 'positive' : (['伤官', '劫财'].includes(liuNian.shiShen) && liuNian.score < 2.5) ? 'negative' : 'neutral',
  });

  // 健康
  const healthRiskWx = missing.filter((m) => WX_CONTROLS[lnGanWx] === m || WX_CONTROLS[lnZhiWx] === m);
  const healthNegative = healthRiskWx.length > 0 || (['七杀', '伤官'].includes(liuNian.shiShen) && dayMasterStrength === '偏弱');
  verdicts.push({
    dimension: '健康',
    icon: '🏥',
    text: theme.health + (healthRiskWx.length > 0 ? `，尤其关注${healthRiskWx.map(w => WX_ORGAN[w] || w).join('、')}` : ''),
    type: healthNegative ? 'negative' : (['正印', '食神'].includes(liuNian.shiShen)) ? 'positive' : 'neutral',
  });

  // --- 4. 关键提示 ---
  const tips: LiuNianTip[] = [];

  // 风险提示
  if (hasChong) {
    const chongPillars = yuanJuRelations.filter((r) => r.clashOrHarmony.some((c) => c.includes('冲')));
    for (const cp of chongPillars) {
      tips.push({
        text: `${cp.clashOrHarmony.find(c => c.includes('冲'))}：${cp.impactDimension}方面有变动或冲突风险`,
        type: 'risk',
      });
    }
  }
  if (lnUnfavorable && !dyFavorable) {
    tips.push({ text: '流年五行不利且大运支撑不足，大事宜缓不宜急', type: 'risk' });
  }
  if (['劫财'].includes(liuNian.shiShen)) {
    tips.push({ text: '流年劫财当令，注意财务安全，不宜借贷担保', type: 'risk' });
  }
  if (['七杀'].includes(liuNian.shiShen) && dayMasterStrength === '偏弱') {
    tips.push({ text: '身弱逢七杀流年，工作压力大，注意健康和情绪管理', type: 'risk' });
  }

  // 机会提示
  if (hasHe) {
    const hePillars = yuanJuRelations.filter((r) => r.clashOrHarmony.some((c) => c.includes('合')));
    for (const hp of hePillars) {
      tips.push({
        text: `${hp.clashOrHarmony.find(c => c.includes('合'))}：${hp.impactDimension}方面有合作或贵人机缘`,
        type: 'opportunity',
      });
    }
  }
  if (lnSupplies.length > 0) {
    tips.push({ text: `流年补齐所缺${lnSupplies.join('、')}行，利于改善对应方面短板`, type: 'opportunity' });
  }
  if (lnFavorable && dyFavorable) {
    tips.push({ text: '流年大运五行皆利，适合积极进取、把握大机会', type: 'opportunity' });
  }
  if (['正官', '正印'].includes(liuNian.shiShen) && liuNian.score >= 3.0) {
    tips.push({ text: '流年官印相生，升职加薪、考试晋升的好时机', type: 'opportunity' });
  }

  return {
    year: liuNian.year,
    ganZhi: liuNian.ganZhi,
    gan: liuNian.gan,
    zhi: liuNian.zhi,
    ganWuxing: lnGanWx,
    zhiWuxing: lnZhiWx,
    shiShen: liuNian.shiShen,
    zhiShiShen,
    naYin: liuNian.naYin,
    score: liuNian.score,
    grade: liuNian.grade,
    yuanJuRelations,
    yuanJuSummary,
    daYunInteraction,
    verdicts,
    tips,
  };
}

// ==================== 大运断语分析（DaYun Analysis） ====================

/** 十神对应的大运十年主题 */
const SHISHEN_DAYUN_THEME: Record<string, {
  overview: string;
  career: string;
  wealth: string;
  marriage: string;
  health: string;
}> = {
  '比肩': {
    overview: '比肩运主竞争与并肩，同辈助力与争夺并存',
    career: '事业竞争加剧，需巩固核心优势，团队合作中注意话语权',
    wealth: '财运平稳偏紧，不宜合伙经营，守好本业为上',
    marriage: '感情趋于平淡，双方各忙各的，需主动经营互动',
    health: '精力充沛但易冲动，注意运动安全',
  },
  '劫财': {
    overview: '劫财运主社交活跃，人脉拓展同时暗藏耗财之象',
    career: '事业有拓展机会，但需防同行竞争、合伙纠纷',
    wealth: '破财风险偏高，不宜借贷担保，投资需保守',
    marriage: '异性缘增加但桃花杂乱，已婚者注意感情维护',
    health: '脾气易躁，注意控制情绪，防外伤',
  },
  '食神': {
    overview: '食神运主才华展现、生活惬意，是创作和表达的好时期',
    career: '适合展示专业才能，创意类工作有突破，口碑提升',
    wealth: '才华变现机会增多，副业可期，收入有增长空间',
    marriage: '感情甜蜜和谐，生活品质提升，利生育',
    health: '食欲旺盛，注意饮食节制，防体重增加',
  },
  '伤官': {
    overview: '伤官运主创新突破，思维活跃但口舌是非增多',
    career: '敢于挑战权威，有创新成果，但人际关系需谨慎处理',
    wealth: '投机收益与风险并存，适合技术变现，不宜激进',
    marriage: '言语冲突增多，宜忍让包容，未婚者恋爱波折',
    health: '注意口腔、消化系统和呼吸道',
  },
  '正财': {
    overview: '正财运主稳定收入、务实经营，是积累财富的踏实阶段',
    career: '工作稳定有晋升空间，适合深耕本业，有加薪机会',
    wealth: '正财入库，收入稳步增长，适合稳健理财',
    marriage: '男命利婚姻，感情稳定有归属感',
    health: '身体消耗偏大，注意劳逸结合',
  },
  '偏财': {
    overview: '偏财运主意外机遇，商机涌现但需把控风险',
    career: '有跨界发展或意外机遇，适合开拓新业务领域',
    wealth: '偏财可期，投资有回报，但切忌贪多冒进',
    marriage: '社交桃花旺盛，应酬增多，已婚者注意分寸',
    health: '应酬多注意肝胃，生活作息易不规律',
  },
  '正官': {
    overview: '正官运主规范进取，有升迁机会，贵人提携的好时期',
    career: '事业上升期，有升职晋级机会，上级关系融洽',
    wealth: '收入稳中有升，适合体制内发展或规范化经营',
    marriage: '女命利婚姻，有正缘出现的机会',
    health: '工作压力增大，注意心血管和睡眠质量',
  },
  '七杀': {
    overview: '七杀运主压力与挑战，是锻炼能力、逆境成长的考验期',
    career: '竞争激烈、压力大，但能力提升快，适合拼搏进取',
    wealth: '财运波动较大，险中求财，需见好就收',
    marriage: '感情有波折和考验，需耐心磨合沟通',
    health: '精神压力大，注意睡眠和情绪管理',
  },
  '正印': {
    overview: '正印运主贵人助力、学业有成，是充电提升的好阶段',
    career: '适合学习深造、考取资质，有长辈或贵人扶持',
    wealth: '财运不温不火，不宜冒险投资，稳守为主',
    marriage: '感情平和温馨，家庭关系和睦',
    health: '身体恢复期，利于养生调理',
  },
  '偏印': {
    overview: '偏印运主独立思考、技术钻研，适合沉淀积累但社交减少',
    career: '适合研究性、技术性工作，不宜频繁社交或跳槽',
    wealth: '财运平淡，不宜大额投资，小心被套',
    marriage: '感情有冷淡倾向，需主动经营，防孤独感',
    health: '注意消化系统和心理情绪调节',
  },
};

/** 大运断语-特殊年份提示 */
export interface DaYunSpecialYear {
  year: number;
  ganZhi: string;
  tip: string;
  type: 'risk' | 'opportunity' | 'turning';
  reason: string;
}

/** 大运断语-维度判断 */
export interface DaYunDimVerdict {
  dimension: string;
  icon: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

/** 大运断语分析完整结果 */
export interface DaYunAnalysis {
  /** 大运干支 */
  ganZhi: string;
  ganWuxing: string;
  zhiWuxing: string;
  shiShen: string;
  score: number;
  grade: string;
  /** 十年总述 */
  summary: string;
  /** 与原局的核心作用关系 */
  wxInteraction: string;
  /** 四维度判断 */
  dimVerdicts: DaYunDimVerdict[];
  /** 特殊年份提示（2-3个） */
  specialYears: DaYunSpecialYear[];
}

/**
 * 大运断语分析
 *
 * 综合「八字原局 + 该步大运 + 对应10年流年」推导：
 * 1. 十年总述：大运五行与原局喜忌的匹配 + 合冲关系 + 补缺检测
 * 2. 四维断语：事业/财运/感情/健康的整体判断
 * 3. 特殊年份：从10年流年中筛选伏吟/反吟/极端评分/多重冲克的关键年份
 */
export function getDaYunAnalysis(
  baziResult: BaziResult,
  daYun: DaYunItem,
  liuNianList: LiuNianItem[],
): DaYunAnalysis {
  const { pillars, dayMaster, wuxingAnalysis } = baziResult;
  const { dayMasterStrength, missing } = wuxingAnalysis;
  const dayWx = WU_XING_MAP[dayMaster];
  const dyGanWx = daYun.ganWuxing;
  const dyZhiWx = daYun.zhiWuxing;
  const elements = ['木', '火', '土', '金', '水'];

  // --- 用神/忌神 ---
  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx);
  const iGen = WX_GENERATES[dayWx];
  const iCtrl = WX_CONTROLS[dayWx];
  const ctrlMe = elements.find((e) => WX_CONTROLS[e] === dayWx);

  let yongShen: string[] = [];
  let jiShen: string[] = [];
  if (dayMasterStrength === '偏弱') {
    yongShen = [dayWx, genMe].filter(Boolean) as string[];
    jiShen = [iGen, iCtrl, ctrlMe].filter(Boolean) as string[];
  } else if (dayMasterStrength === '偏强') {
    yongShen = [iGen, iCtrl, ctrlMe].filter(Boolean) as string[];
    jiShen = [dayWx, genMe].filter(Boolean) as string[];
  } else {
    yongShen = [iGen, dayWx].filter(Boolean) as string[];
  }

  const ganFavorable = yongShen.includes(dyGanWx);
  const zhiFavorable = yongShen.includes(dyZhiWx);
  const ganUnfavorable = jiShen.includes(dyGanWx);
  const zhiUnfavorable = jiShen.includes(dyZhiWx);

  // --- 大运与原局合冲检测 ---
  const dyClashes: string[] = [];
  const dyHarmonies: string[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    if (GAN_WU_HE[daYun.gan] === p.gan) dyHarmonies.push(`${daYun.gan}${p.gan}合（${pillarNames[i]}）`);
    if (ZHI_CHONG[daYun.zhi] === p.zhi) dyClashes.push(`${daYun.zhi}${p.zhi}冲（${pillarNames[i]}）`);
    if (ZHI_HE[daYun.zhi] === p.zhi) dyHarmonies.push(`${daYun.zhi}${p.zhi}合（${pillarNames[i]}）`);
  }

  // --- 补缺检测 ---
  const supplements = missing.filter((m) => m === dyGanWx || m === dyZhiWx);

  // --- 构建十年总述 ---
  const theme = SHISHEN_DAYUN_THEME[daYun.shiShen] || SHISHEN_DAYUN_THEME['比肩'];

  let wxInteraction = `大运${daYun.ganZhi}（${dyGanWx}${dyZhiWx}），十神${daYun.shiShen}。`;
  if (ganFavorable && zhiFavorable) {
    wxInteraction += `干支五行皆合用神，整体助力强劲。`;
  } else if (ganFavorable || zhiFavorable) {
    wxInteraction += `${ganFavorable ? '天干' : '地支'}五行合用神，有一定助力。`;
  } else if (ganUnfavorable && zhiUnfavorable) {
    wxInteraction += `干支五行皆为忌神，此运需谨慎应对。`;
  } else if (ganUnfavorable || zhiUnfavorable) {
    wxInteraction += `${ganUnfavorable ? '天干' : '地支'}五行偏忌，部分方面承压。`;
  } else {
    wxInteraction += `五行中性，运势平稳过渡。`;
  }

  if (supplements.length > 0) {
    wxInteraction += `补原局所缺${supplements.join('、')}行，改善短板。`;
  }
  if (dyClashes.length > 0) {
    wxInteraction += `与原局有冲：${dyClashes.join('、')}，此运变动较大。`;
  }
  if (dyHarmonies.length > 0) {
    wxInteraction += `与原局有合：${dyHarmonies.join('、')}，人际融洽。`;
  }

  // --- 总述拼接 ---
  const avgScore = liuNianList.length > 0
    ? liuNianList.reduce((s, l) => s + l.score, 0) / liuNianList.length
    : daYun.score;
  let trendWord = '平稳';
  if (avgScore >= 3.5) trendWord = '上升';
  else if (avgScore >= 2.8) trendWord = '稳中有进';
  else if (avgScore >= 2.0) trendWord = '平稳';
  else trendWord = '承压';

  const summary = `${theme.overview}。日主${dayMasterStrength}，此运整体走势${trendWord}（均分${Math.round(avgScore * 10) / 10}）。${supplements.length > 0 ? `大运补齐${supplements.join('、')}行不足，利于改善对应方面。` : ''}`;

  // --- 四维断语 ---
  const dimVerdicts: DaYunDimVerdict[] = [];

  const careerPositive = ['正官', '正印', '七杀'].includes(daYun.shiShen) && (ganFavorable || zhiFavorable || daYun.score >= 3.0);
  const careerNegative = ['比肩', '劫财', '伤官'].includes(daYun.shiShen) && (ganUnfavorable || daYun.score < 2.0);
  dimVerdicts.push({
    dimension: '事业', icon: '💼', text: theme.career,
    type: careerPositive ? 'positive' : careerNegative ? 'negative' : 'neutral',
  });

  const wealthPositive = ['正财', '偏财', '食神'].includes(daYun.shiShen) && (ganFavorable || zhiFavorable);
  const wealthNegative = ['劫财', '比肩'].includes(daYun.shiShen) && (ganUnfavorable || zhiUnfavorable);
  dimVerdicts.push({
    dimension: '财运', icon: '💰', text: theme.wealth,
    type: wealthPositive ? 'positive' : wealthNegative ? 'negative' : 'neutral',
  });

  const marriagePositive = ['正财', '正官'].includes(daYun.shiShen) && daYun.score >= 2.5;
  const marriageNegative = ['伤官', '劫财'].includes(daYun.shiShen) && daYun.score < 2.5;
  dimVerdicts.push({
    dimension: '感情', icon: '💑', text: theme.marriage,
    type: marriagePositive ? 'positive' : marriageNegative ? 'negative' : 'neutral',
  });

  const healthNegative = ['七杀', '伤官'].includes(daYun.shiShen) && dayMasterStrength === '偏弱';
  const healthPositive = ['正印', '食神'].includes(daYun.shiShen) && (ganFavorable || zhiFavorable);
  dimVerdicts.push({
    dimension: '健康', icon: '🏥', text: theme.health,
    type: healthPositive ? 'positive' : healthNegative ? 'negative' : 'neutral',
  });

  // --- 特殊年份筛选 ---
  interface SpecialCandidate {
    ln: LiuNianItem;
    priority: number;
    reasons: string[];
    tip: string;
    type: 'risk' | 'opportunity' | 'turning';
  }
  const candidates: SpecialCandidate[] = [];

  for (const ln of liuNianList) {
    const reasons: string[] = [];
    let priority = 0;
    let type: 'risk' | 'opportunity' | 'turning' = 'turning';
    let tip = '';

    // 伏吟：流年干支 = 大运干支
    if (ln.gan === daYun.gan && ln.zhi === daYun.zhi) {
      reasons.push('伏吟（流年与大运干支相同）');
      tip = '伏吟之年事有反复，注意情绪波动和重复困局';
      priority += 3;
      type = 'risk';
    }

    // 反吟：流年地支冲大运地支
    if (ZHI_CHONG[ln.zhi] === daYun.zhi) {
      reasons.push('反吟（流年地支冲大运地支）');
      if (!tip) tip = '反吟之年变动剧烈，重大决策宜缓行';
      priority += 2.5;
      type = 'risk';
    }

    // 与原局多重冲克
    const clashCount = ln.relations.filter((r) => r.includes('冲')).length;
    const harmonyCount = ln.relations.filter((r) => r.includes('合')).length;
    if (clashCount >= 2) {
      reasons.push(`与原局多重冲克（${clashCount}冲）`);
      if (!tip) tip = '多柱受冲，此年变动较大，注意人际和健康';
      priority += 2;
      type = 'risk';
    }

    // 极低分
    if (ln.score <= 1.5) {
      reasons.push(`评分极低（${ln.score}分）`);
      if (!tip) tip = '五行失衡严重，各方面需格外谨慎';
      priority += 2;
      type = 'risk';
    }

    // 极高分
    if (ln.score >= 4.2) {
      reasons.push(`评分极高（${ln.score}分）`);
      if (!tip) tip = '五行配合良好，适合把握重大机遇';
      priority += 2;
      type = 'opportunity';
    }

    // 多重合
    if (harmonyCount >= 2) {
      reasons.push(`与原局多重合（${harmonyCount}合）`);
      if (!tip) tip = '多合之年贵人缘旺，适合推进合作';
      priority += 1.5;
      type = 'opportunity';
    }

    if (reasons.length > 0) {
      candidates.push({ ln, priority, reasons, tip, type });
    }
  }

  // 按优先级排序，取前 2-3 个
  candidates.sort((a, b) => b.priority - a.priority);
  const topSpecial = candidates.slice(0, 3);

  const specialYears: DaYunSpecialYear[] = topSpecial.map((c) => ({
    year: c.ln.year,
    ganZhi: c.ln.ganZhi,
    tip: c.tip,
    type: c.type,
    reason: c.reasons.join('；'),
  }));

  // 如果没有特殊年份
  if (specialYears.length === 0) {
    specialYears.push({
      year: 0,
      ganZhi: '',
      tip: '本运十年无重大波动，整体平稳',
      type: 'opportunity',
      reason: '各年份评分均匀，无明显冲合',
    });
  }

  return {
    ganZhi: daYun.ganZhi,
    ganWuxing: dyGanWx,
    zhiWuxing: dyZhiWx,
    shiShen: daYun.shiShen,
    score: daYun.score,
    grade: daYun.grade,
    summary,
    wxInteraction,
    dimVerdicts,
    specialYears,
  };
}

// ==================== Re-export 解读引擎 ====================

export { getBaziInterpretation } from './bazi-interpretation';
export type { BaziInterpretation, DimensionInterpretation, HighlightItem, PeriodRef } from './bazi-interpretation';
