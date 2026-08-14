'use client';

import { useState } from 'react';
import type { DivinationResult, MeihuaAnalysis, VerdictLevel } from '@/lib/meihua';

interface QuaAnalysisProps {
  result: DivinationResult;
  analysis: MeihuaAnalysis;
}

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

const LEVEL_COLORS: Record<VerdictLevel, { text: string; bg: string; border: string }> = {
  '吉': { text: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  '平': { text: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  '忌': { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

/** 单个问事维度卡片（复用原有样式） */
function VerdictCard({ v }: { v: { category: string; icon: string; level: VerdictLevel; conclusion: string; advice: string } }) {
  const lc = LEVEL_COLORS[v.level];
  return (
    <div
      className="p-3 rounded-xl"
      style={{ backgroundColor: lc.bg, border: `1px solid ${lc.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{v.icon}</span>
          <span className="text-base font-bold" style={{ color: lc.text }}>{v.category}</span>
        </div>
        <span
          className="text-sm px-2 py-0.5 rounded-full font-bold"
          style={{ color: lc.text, backgroundColor: lc.border }}
        >
          {v.level}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#333' }}>
        {v.conclusion}
      </p>
      <p className="text-sm mt-1 leading-relaxed" style={{ color: '#666' }}>
        建议：{v.advice}
      </p>
    </div>
  );
}

export default function QuaAnalysis({ result, analysis }: QuaAnalysisProps) {
  const { tiYong, movingLineInterpretation, verdicts, keyTips, elementInteractions } = analysis;

  /* 增强：将问事维度分为核心(原有4个)和扩展(新增7个) */
  const coreVerdicts = verdicts.filter((v) => v.group === 'core');
  const extendedVerdicts = verdicts.filter((v) => v.group === 'extended');
  const [showExtended, setShowExtended] = useState(false);

  return (
    <div className="card-chinese p-5 md:p-6 space-y-5">
      {/* 体用关系 */}
      <section>
        <SectionTitle>体用关系</SectionTitle>
        <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
          {/* 体卦 */}
          <div
            className="flex-1 p-4 rounded-xl text-center"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
          >
            <div className="text-xs mb-1" style={{ color: '#15803D' }}>体卦</div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {result.tiGua.name}
            </div>
            <div className="text-sm mt-1" style={{ color: '#15803D' }}>{result.tiGua.element} · {result.tiGua.nature}</div>
          </div>

          {/* 生克关系 */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{
                color: tiYong.favorable ? '#15803D' : '#DC2626',
                backgroundColor: tiYong.favorable ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${tiYong.favorable ? '#BBF7D0' : '#FECACA'}`,
              }}
            >
              {tiYong.relation}
            </span>
            <span className="text-xs" style={{ color: '#999' }}>
              {tiYong.tiElement} ↔ {tiYong.yongElement}
            </span>
          </div>

          {/* 用卦 */}
          <div
            className="flex-1 p-4 rounded-xl text-center"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <div className="text-xs mb-1" style={{ color: '#DC2626' }}>用卦</div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {result.yongGua.name}
            </div>
            <div className="text-sm mt-1" style={{ color: '#DC2626' }}>{result.yongGua.element} · {result.yongGua.nature}</div>
          </div>
        </div>

        <p className="text-base mt-3 leading-relaxed" style={{ color: '#333' }}>
          {tiYong.summary}
        </p>
      </section>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 动爻解读（增强：支持多段落显示） */}
      <section>
        <SectionTitle>动爻解读</SectionTitle>
        <div className="text-base mt-2 leading-relaxed whitespace-pre-line" style={{ color: '#333' }}>
          {movingLineInterpretation}
        </div>
      </section>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 五行生克详解 */}
      <section>
        <SectionTitle>五行生克</SectionTitle>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#666' }}>
          {elementInteractions}
        </p>
      </section>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 问事结论：核心4维度（原有布局不变） */}
      <section>
        <SectionTitle>问事分析</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {coreVerdicts.map((v) => (
            <VerdictCard key={v.category} v={v} />
          ))}
        </div>

        {/* 增强：扩展问事维度（折叠面板） */}
        {extendedVerdicts.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowExtended(!showExtended)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors w-full justify-center"
              style={{
                color: 'var(--color-cinnabar)',
                border: '1px solid var(--color-border-warm)',
                backgroundColor: showExtended ? 'var(--color-parchment)' : 'transparent',
                fontFamily: 'var(--font-family-kai)',
              }}
            >
              <span>{showExtended ? '收起' : '展开更多问事维度'}</span>
              <span className="text-xs">（学业、求职、出行、官司、寻物、家宅、交易）</span>
            </button>

            {showExtended && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {extendedVerdicts.map((v) => (
                  <VerdictCard key={v.category} v={v} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 关键提示 */}
      <section>
        <SectionTitle>关键提示</SectionTitle>
        <div className="mt-3 space-y-2">
          {keyTips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm leading-relaxed"
              style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border-warm)' }}
            >
              <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-gold)' }}>◆</span>
              <span style={{ color: '#333' }}>{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 免责声明 */}
      <div
        className="text-disclaimer text-center pt-3"
        style={{ borderTop: '1px solid var(--color-border-warm)' }}
      >
        * 梅花易数分析基于传统易学理论推导，仅供参考，不构成任何决策建议
      </div>
    </div>
  );
}
