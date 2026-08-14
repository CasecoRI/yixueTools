'use client';

import { useState, useRef, useEffect } from 'react';
import type { DaYunResult, DaYunAnalysis } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface DaYunTimelineProps {
  data: DaYunResult;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  analysis?: DaYunAnalysis | null;
}

/** 运势等级配色 */
const GRADE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  '上吉': { text: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  '小吉': { text: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  '平':   { text: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  '小凶': { text: '#C2410C', bg: '#FFF7ED', border: '#FDBA74' },
  '凶':   { text: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

/** 断语类型配色 */
const VERDICT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  positive: { text: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  negative: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  neutral:  { text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
};

/** 特殊年份类型配色 */
const SPECIAL_COLORS: Record<string, { text: string; bg: string; icon: string }> = {
  risk:        { text: '#DC2626', bg: '#FEF2F2', icon: '▲' },
  opportunity: { text: '#15803D', bg: '#F0FDF4', icon: '★' },
  turning:     { text: '#B8860B', bg: '#FFFBEB', icon: '◆' },
};

/**
 * 大运时间轴组件（增强版）
 *
 * 展示 8 步大运，每步 10 年，横向可滚动卡片布局。
 * 点击选中后展示该大运的十年断语面板：十年总述 + 四维判断 + 特殊年份提示。
 * 移动端断语默认折叠，桌面端直接展示。
 */
export default function DaYunTimeline({ data, selectedIndex, onSelect, analysis }: DaYunTimelineProps) {
  const currentYear = new Date().getFullYear();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const userClicked = useRef(false);

  // 切换大运时重置移动端折叠状态
  useEffect(() => {
    setMobileExpanded(false);
  }, [selectedIndex]);

  // 断语面板出现时，仅用户主动点击大运卡片才滚动
  useEffect(() => {
    if (analysis && panelRef.current && userClicked.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      userClicked.current = false;
    }
  }, [analysis]);

  return (
    <div className="card-chinese p-5 md:p-6">
      {/* 标题 + 起运信息 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
          大运排盘
        </h3>
        <div className="flex items-center gap-2 text-base">
          <span
            className="px-2.5 py-1 rounded-lg border"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            起运{' '}
            <span
              className="font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {data.startAgeDesc}
            </span>
          </span>
          <span
            className="px-2.5 py-1 rounded-lg border"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            <span style={{ color: 'var(--color-primary-dark)' }}>
              {data.direction === '顺' ? '顺排' : '逆排'}
            </span>
          </span>
        </div>
      </div>

      {/* 提示 — 统一14px最低阈值 */}
      <p className="mb-3" style={{ fontSize: '14px', color: '#666666', lineHeight: '1.5' }}>
        点击大运卡片查看该十年运势断语与流年详情
      </p>

      {/* 大运卡片列表 - 横向可滚动 */}
      <div className="overflow-x-auto pb-2 -mx-1">
        {/* 【修改】卡片间距从 gap-2/3 增至 gap-3/4 */}
        <div className="flex gap-3 md:gap-4 px-1" style={{ minWidth: 'max-content' }}>
          {data.daYunList.map((dy) => {
            const isCurrent = currentYear >= dy.startYear && currentYear <= dy.endYear;
            const isSelected = selectedIndex === dy.index;
            const gradeColor = GRADE_COLORS[dy.grade] || GRADE_COLORS['平'];

            return (
              <div
                key={dy.index}
                className="flex flex-col items-center rounded-xl transition-all cursor-pointer hover:shadow-md"
                style={{
                  /* 【修改】卡片宽度从 88px 增至 120px，适配放大后的文字 */
                  minWidth: '120px',
                  /* 【修复】选中态：边框 1px + 朱砂红色；非选中态：1px + 暖边框色 */
                  border: `1px solid ${isSelected ? '#C23B22' : isCurrent ? 'var(--color-cinnabar)' : 'var(--color-border-warm)'}`,
                  /* 【修复】选中背景 #FFF9F2（极浅宣纸金）；当前运 parchment；默认白 */
                  backgroundColor: isSelected
                    ? '#FFF9F2'
                    : isCurrent
                      ? 'var(--color-parchment)'
                      : '#fff',
                  /* 【修复】去除 scale 和外发光，改为简洁阴影 */
                  boxShadow: isSelected
                    ? '0 2px 8px rgba(194, 59, 34, 0.12)'
                    : 'none',
                  /* 【修改】内边距增大，提升呼吸感 */
                  padding: '16px 14px',
                }}
                onClick={() => { userClicked.current = true; onSelect?.(dy.index); }}
              >
                {/* 【修复】选中态顶部横线标识 —— 3px 朱砂红，宽度与内边距对齐 */}
                {/* 始终占位以防止选中时布局抖动，未选中时透明 */}
                <div
                  className="w-full rounded-full"
                  style={{
                    height: '3px',
                    backgroundColor: isSelected ? '#C23B22' : 'transparent',
                    marginBottom: '8px',
                  }}
                />

                {/* 【放大】运势等级标签 —— 10px → 16px，weight 500 */}
                <span
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: gradeColor.text,
                    backgroundColor: gradeColor.bg,
                    border: `1px solid ${gradeColor.border}`,
                    lineHeight: '1.4',
                    marginBottom: '8px',
                  }}
                >
                  {dy.grade}
                </span>

                {/* 【微调】天干 —— 20px → 24px，weight 700→600，保留五行配色 */}
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[dy.ganWuxing]?.text || '#5A2E1A',
                    lineHeight: '1.4',
                  }}
                >
                  {dy.gan}
                </span>

                {/* 【微调】地支 —— 20px → 24px，weight 700→600，保留五行配色 */}
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[dy.zhiWuxing]?.text || '#5A2E1A',
                    lineHeight: '1.4',
                    marginTop: '2px',
                  }}
                >
                  {dy.zhi}
                </span>

                {/* 【放大】十神 —— 10px → 16px，weight 500，色深棕 */}
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#5A2E1A',
                    lineHeight: '1.4',
                    marginTop: '8px',
                  }}
                >
                  {dy.shiShen}
                </span>

                {/* 【放大】年龄范围 —— 12px → 16px，weight 500 */}
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#5A2E1A',
                    lineHeight: '1.4',
                    marginTop: '8px',
                  }}
                >
                  {dy.startAge}-{dy.endAge}岁
                </span>

                {/* 【放大】年份范围 —— 10px → 14px，weight 500，辅助色 */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#666666',
                    lineHeight: '1.4',
                    marginTop: '2px',
                  }}
                >
                  {dy.startYear}-{dy.endYear}
                </span>

                {/* 【放大】纳音 —— 9px → 18px，weight 400 */}
                {dy.naYin && (
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 400,
                      color: 'var(--color-gold)',
                      lineHeight: '1.4',
                      marginTop: '8px',
                    }}
                  >
                    {dy.naYin}
                  </span>
                )}

                {/* 【保留】「当前」标签 —— 朱砂红底色不变，字号微调至 11px */}
                {isCurrent && (
                  <span
                    className="rounded font-medium text-white"
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'var(--color-cinnabar)',
                      padding: '2px 8px',
                      marginTop: '8px',
                    }}
                  >
                    当前
                  </span>
                )}
                {/* 选中非当前运时，用低调标签避免视觉干扰 */}
                {isSelected && !isCurrent && (
                  <span
                    className="rounded font-medium"
                    style={{
                      fontSize: '11px',
                      color: '#5A2E1A',
                      backgroundColor: '#F5E6D3',
                      padding: '2px 8px',
                      marginTop: '8px',
                    }}
                  >
                    查看中
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 图例 — 统一14px */}
      <div className="flex flex-wrap items-center gap-2 mt-4" style={{ fontSize: '14px' }}>
        <span style={{ color: '#666666' }}>运势等级：</span>
        {Object.entries(GRADE_COLORS).map(([grade, colors]) => (
          <span
            key={grade}
            className="px-1.5 py-0.5 rounded-full"
            style={{
              color: colors.text,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            {grade}
          </span>
        ))}
      </div>

      {/* ====== 大运断语面板 ====== */}
      {analysis && selectedIndex !== undefined && (
        <div
          ref={panelRef}
          className="mt-5 rounded-2xl overflow-hidden"
          style={{
            border: '2px solid var(--color-border-warm)',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
          }}
        >
          {/* 面板标题 */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: 'var(--color-parchment)', borderBottom: '1px solid var(--color-border-warm)' }}
          >
            <div className="flex items-center gap-3">
              <h4
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-cinnabar)' }}
              >
                {analysis.ganZhi} 大运 · 十年断语
              </h4>
              <span
                className="text-sm px-2 py-0.5 rounded-full font-medium"
                style={{
                  color: (GRADE_COLORS[analysis.grade] || GRADE_COLORS['平']).text,
                  backgroundColor: (GRADE_COLORS[analysis.grade] || GRADE_COLORS['平']).bg,
                  border: `1px solid ${(GRADE_COLORS[analysis.grade] || GRADE_COLORS['平']).border}`,
                }}
              >
                {analysis.grade} ({analysis.score}分)
              </span>
              <span className="flex gap-1">
                <WxTag wx={analysis.ganWuxing} />
                <WxTag wx={analysis.zhiWuxing} />
              </span>
            </div>

            {/* 移动端展开/收起按钮 */}
            <button
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="md:hidden text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: 'var(--color-primary-dark)',
                backgroundColor: 'var(--color-parchment)',
                border: '1px solid var(--color-border-warm)',
              }}
            >
              {mobileExpanded ? '收起详情' : '展开详情'}
            </button>
          </div>

          {/* 面板内容：桌面端始终展示，移动端需点击展开 */}
          <div className={`${mobileExpanded ? 'block' : 'hidden'} md:block`}>
            <div className="p-5 space-y-5">
              {/* 十年总述 */}
              <section>
                <SectionTitle>十年总述</SectionTitle>
                <p
                  className="text-base mt-2 leading-relaxed"
                  style={{ color: '#333' }}
                >
                  {analysis.summary}
                </p>
                <p
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: '#666666' }}
                >
                  {analysis.wxInteraction}
                </p>
              </section>

              {/* 分隔线 */}
              <hr style={{ borderColor: 'var(--color-border-warm)' }} />

              {/* 核心影响 */}
              <section>
                <SectionTitle>核心影响</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {analysis.dimVerdicts.map((v) => {
                    const vc = VERDICT_COLORS[v.type];
                    return (
                      <div
                        key={v.dimension}
                        className="px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: vc.bg, border: `1px solid ${vc.border}` }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{v.icon}</span>
                          <span className="text-base font-bold" style={{ color: vc.text }}>{v.dimension}</span>
                        </div>
                        <p className="text-base leading-relaxed" style={{ color: vc.text }}>
                          {v.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 分隔线 */}
              <hr style={{ borderColor: 'var(--color-border-warm)' }} />

              {/* 特殊年份提示 */}
              <section>
                <SectionTitle>特殊年份提示</SectionTitle>
                <div className="mt-3 space-y-2">
                  {analysis.specialYears.map((sy, i) => {
                    const sc = SPECIAL_COLORS[sy.type];
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: sc.bg }}
                      >
                        <span className="shrink-0 font-bold mt-px text-base" style={{ color: sc.text }}>
                          {sc.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          {sy.year > 0 ? (
                            <>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className="text-base font-bold"
                                  style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-cinnabar)' }}
                                >
                                  {sy.year}年
                                </span>
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: 'var(--color-gold)' }}
                                >
                                  （{sy.ganZhi}）
                                </span>
                              </div>
                              <p
                                className="text-base leading-relaxed font-bold"
                                style={{ color: 'var(--color-gold)' }}
                              >
                                {sy.tip}
                              </p>
                              <p
                                className="text-sm mt-0.5 leading-relaxed"
                                style={{ color: '#666666' }}
                              >
                                依据：{sy.reason}
                              </p>
                            </>
                          ) : (
                            <p
                              className="text-sm leading-relaxed font-bold"
                              style={{ color: 'var(--color-gold)' }}
                            >
                              {sy.tip}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* 底部声明 */}
            <div
              className="text-disclaimer px-5 py-2 text-center"
              style={{ borderTop: '1px solid var(--color-border-warm)' }}
            >
              * 大运断语基于子平八字理论推导，仅供参考，不构成任何决策建议
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- 子组件 ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-cinnabar)' }} />
      <span
        className="text-base font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {children}
      </span>
    </div>
  );
}

function WxTag({ wx }: { wx: string }) {
  const color = WU_XING_COLORS[wx];
  if (!color) return null;
  return (
    <span
      className="text-sm px-1.5 py-0.5 rounded font-medium"
      style={{ color: color.text, backgroundColor: color.bg }}
    >
      {wx}
    </span>
  );
}
