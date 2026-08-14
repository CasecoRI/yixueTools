'use client';

import { useRef, useEffect } from 'react';
import type { LiuNianAnalysis } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface LiuNianDetailPanelProps {
  analysis: LiuNianAnalysis;
  onClose: () => void;
}

/** 断语类型配色 */
const VERDICT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  positive: { text: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  negative: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  neutral:  { text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
};

/** 提示类型配色 */
const TIP_COLORS: Record<string, { text: string; bg: string; icon: string }> = {
  risk:        { text: '#DC2626', bg: '#FEF2F2', icon: '▲' },
  opportunity: { text: '#15803D', bg: '#F0FDF4', icon: '★' },
};

/** 五行关系倾向配色 */
const TENDENCY_COLORS: Record<string, { text: string; bg: string }> = {
  positive: { text: '#15803D', bg: '#DCFCE7' },
  negative: { text: '#DC2626', bg: '#FEF2F2' },
  neutral:  { text: '#92400E', bg: '#FEF9C3' },
};

/** 运势等级配色 */
const GRADE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  '上吉': { text: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  '小吉': { text: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  '平':   { text: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  '小凶': { text: '#C2410C', bg: '#FFF7ED', border: '#FDBA74' },
  '凶':   { text: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

/**
 * 流年详情面板
 */
export default function LiuNianDetailPanel({ analysis, onClose }: LiuNianDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [analysis.year]);

  const gradeColor = GRADE_COLORS[analysis.grade] || GRADE_COLORS['平'];
  const tendencyColor = TENDENCY_COLORS[analysis.daYunInteraction.tendencyType];

  return (
    <div
      ref={panelRef}
      className="mt-4 rounded-2xl overflow-hidden"
      style={{
        border: '2px solid var(--color-border-warm)',
        backgroundColor: '#fff',
        boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
      }}
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: 'var(--color-parchment)', borderBottom: '1px solid var(--color-border-warm)' }}
      >
        <div className="flex items-center gap-3">
          <h4
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-cinnabar)' }}
          >
            {analysis.year}年 {analysis.ganZhi} 流年详解
          </h4>
          <span
            className="text-sm px-2 py-0.5 rounded-full font-medium"
            style={{ color: gradeColor.text, backgroundColor: gradeColor.bg, border: `1px solid ${gradeColor.border}` }}
          >
            {analysis.grade} ({analysis.score}分)
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-colors hover:bg-[var(--color-border-warm)]"
          style={{ color: 'var(--color-ink-light)' }}
          title="收起"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* === 基础信息 === */}
        <section>
          <SectionTitle>基础信息</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <InfoCell label="流年干支" value={analysis.ganZhi} highlight>
              <span className="flex gap-1 mt-0.5">
                <WxTag wx={analysis.ganWuxing} />
                <WxTag wx={analysis.zhiWuxing} />
              </span>
            </InfoCell>
            <InfoCell label="天干十神" value={analysis.shiShen} />
            <InfoCell label="地支主气" value={analysis.zhiShiShen || '-'} />
            <InfoCell label="纳音" value={analysis.naYin} />
          </div>
        </section>

        {/* === 原局联动 === */}
        <section>
          <SectionTitle>原局联动</SectionTitle>
          {/* text-sm→text-base(16px) */}
          <p className="text-base mt-2 leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>
            {analysis.yuanJuSummary}
          </p>
          <div className="mt-3 space-y-2">
            {analysis.yuanJuRelations.map((rel) => (
              <div
                key={rel.pillarLabel}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-parchment)' }}
              >
                <span
                  className="font-bold shrink-0 w-12"
                  style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
                >
                  {rel.pillarLabel}
                </span>
                <span className="text-[var(--color-ink-light)]">{rel.pillarGanZhi}</span>
                <span style={{ color: '#555' }}>{rel.ganRelation}</span>
                <span style={{ color: '#555' }}>{rel.zhiRelation}</span>
                {rel.clashOrHarmony.length > 0 && (
                  <span className="flex gap-1 ml-auto">
                    {rel.clashOrHarmony.map((ch, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{
                          color: ch.includes('冲') ? '#DC2626' : '#15803D',
                          backgroundColor: ch.includes('冲') ? '#FEF2F2' : '#F0FDF4',
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* === 大运联动 === */}
        <section>
          <SectionTitle>大运联动</SectionTitle>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* text-xs→text-sm(14px) */}
              <div className="px-3 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-parchment)' }}>
                <span className="font-medium" style={{ color: 'var(--color-primary-dark)' }}>天干互动：</span>
                <span style={{ color: '#555' }}>{analysis.daYunInteraction.ganInteraction}</span>
              </div>
              <div className="px-3 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-parchment)' }}>
                <span className="font-medium" style={{ color: 'var(--color-primary-dark)' }}>地支互动：</span>
                <span style={{ color: '#555' }}>{analysis.daYunInteraction.zhiInteraction}</span>
              </div>
            </div>
            <div
              className="px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: tendencyColor.text, backgroundColor: tendencyColor.bg }}
            >
              综合倾向：{analysis.daYunInteraction.overallTendency}
            </div>
          </div>
        </section>

        {/* === 核心断语 === */}
        <section>
          <SectionTitle>核心断语</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {analysis.verdicts.map((v) => {
              const vc = VERDICT_COLORS[v.type];
              return (
                <div
                  key={v.dimension}
                  className="px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: vc.bg, border: `1px solid ${vc.border}` }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{v.icon}</span>
                    {/* text-xs→text-sm(14px) */}
                    <span className="text-sm font-bold" style={{ color: vc.text }}>{v.dimension}</span>
                  </div>
                  {/* text-xs→text-sm(14px) */}
                  <p className="text-sm leading-relaxed" style={{ color: vc.text }}>
                    {v.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* === 关键提示 === */}
        {analysis.tips.length > 0 && (
          <section>
            <SectionTitle>关键提示</SectionTitle>
            <div className="mt-3 space-y-1.5">
              {analysis.tips.map((tip, i) => {
                const tc = TIP_COLORS[tip.type];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm leading-relaxed"
                    style={{ color: tc.text, backgroundColor: tc.bg }}
                  >
                    <span className="shrink-0 font-bold mt-px">{tc.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 底部提示 — 10px→14px */}
      <div className="text-disclaimer px-5 py-2" style={{ borderTop: '1px solid var(--color-border-warm)' }}>
        * 流年分析基于子平八字理论，仅供参考，不构成任何决策建议
      </div>
    </div>
  );
}

// ---- 子组件 ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-cinnabar)' }} />
      {/* text-sm→text-base(16px) */}
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
      className="text-xs px-1.5 py-0.5 rounded font-medium"
      style={{ color: color.text, backgroundColor: color.bg }}
    >
      {wx}
    </span>
  );
}

function InfoCell({
  label,
  value,
  highlight,
  children,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--color-parchment)' }}>
      {/* text-[10px]→text-sm(14px) */}
      <span className="text-sm block" style={{ color: 'var(--color-ink-light)' }}>
        {label}
      </span>
      <span
        className={`text-base font-bold block ${highlight ? 'mt-0.5' : ''}`}
        style={{
          fontFamily: highlight ? 'var(--font-family-kai)' : undefined,
          color: highlight ? 'var(--color-primary-dark)' : '#333',
        }}
      >
        {value}
      </span>
      {children}
    </div>
  );
}
