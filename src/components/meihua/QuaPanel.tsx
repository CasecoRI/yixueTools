'use client';

import { useState } from 'react';
import type { DivinationResult } from '@/lib/meihua';
import { WU_XING_COLORS } from '@/lib/lunar';
import GuaSymbol from './GuaSymbol';

interface QuaPanelProps {
  result: DivinationResult;
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

/** 五行标签 */
function WxTag({ element }: { element: string }) {
  const wxMap: Record<string, string> = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' };
  const colors = WU_XING_COLORS[element];
  return (
    <span
      className="text-sm px-2 py-0.5 rounded-full font-medium"
      style={{ color: colors?.text || '#666', backgroundColor: colors?.bg || '#f0f0f0' }}
    >
      {element}
    </span>
  );
}

const METHOD_NAMES: Record<string, string> = {
  time: '时间起卦', number: '数字起卦', text: '文字起卦',
};

export default function QuaPanel({ result }: QuaPanelProps) {
  const [showYaoCi, setShowYaoCi] = useState(false);

  return (
    <div className="card-chinese p-5 md:p-6 space-y-5">
      {/* 基础信息 */}
      <div>
        <SectionTitle>起卦信息</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <InfoTag label="起卦方式" value={METHOD_NAMES[result.method] || result.method} />
          <InfoTag label="起卦时间" value={result.timestamp} />
          {result.lunarDesc && <InfoTag label="农历" value={result.lunarDesc} />}
          {result.question && <InfoTag label="问事" value={result.question} />}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-sm" style={{ color: '#666' }}>
          <span>上卦数: {result.upperNumber}</span>
          <span>下卦数: {result.lowerNumber}</span>
          <span>动爻数: {result.movingNumber}</span>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 本卦 → 变卦 */}
      <div>
        <SectionTitle>卦象</SectionTitle>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-4">
          {/* 本卦 */}
          <HexagramCard
            hexagram={result.original}
            label="本卦"
            movingLine={result.movingLine.position}
            tiGua={result.tiGua.name}
            yongGua={result.yongGua.name}
          />

          {/* 箭头 */}
          <div className="flex flex-col items-center">
            <span className="text-2xl" style={{ color: 'var(--color-gold)' }}>→</span>
            <span className="text-xs mt-1" style={{ color: '#999' }}>
              {result.movingLine.positionName}动
            </span>
          </div>

          {/* 变卦 */}
          <HexagramCard hexagram={result.changed} label="变卦" />
        </div>

        {/* 体用标注 */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <span>
            <span style={{ color: '#15803D' }}>体卦</span>：{result.tiGua.name}
            <WxTag element={result.tiGua.element} />
          </span>
          <span>
            <span style={{ color: '#DC2626' }}>用卦</span>：{result.yongGua.name}
            <WxTag element={result.yongGua.element} />
          </span>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 卦辞 + 爻辞 */}
      <div>
        <div className="flex items-center justify-between">
          <SectionTitle>卦辞与爻辞</SectionTitle>
          <button
            onClick={() => setShowYaoCi(!showYaoCi)}
            className="text-sm px-3 py-1 rounded-lg transition-colors"
            style={{ color: 'var(--color-cinnabar)', border: '1px solid var(--color-border-warm)' }}
          >
            {showYaoCi ? '收起' : '展开详情'}
          </button>
        </div>

        <div
          className="mt-2 p-3 rounded-lg text-base leading-relaxed"
          style={{
            backgroundColor: 'var(--color-parchment)',
            fontFamily: 'var(--font-family-kai)',
            color: 'var(--color-primary-dark)',
          }}
        >
          <strong>{result.original.name}：</strong>{result.original.guaCi}
        </div>

        {showYaoCi && (
          <div className="mt-3 space-y-1.5">
            {[...result.original.yaoCi].reverse().map((yao, i) => {
              const realIndex = result.original.yaoCi.length - 1 - i;
              const isMoving = realIndex + 1 === result.movingLine.position;
              const names = ['初', '二', '三', '四', '五', '上'];
              const yinYang = result.original.lines[realIndex] ? '九' : '六';
              const prefix = realIndex === 0 ? `初${yinYang}` : realIndex === 5 ? `上${yinYang}` : `${yinYang}${names[realIndex]}`;
              return (
                <div
                  key={realIndex}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: isMoving ? '#FEF2F2' : 'transparent',
                    border: isMoving ? '1px solid #FECACA' : '1px solid transparent',
                  }}
                >
                  <span
                    className="shrink-0 font-bold"
                    style={{ color: isMoving ? 'var(--color-cinnabar)' : 'var(--color-primary-dark)', minWidth: '2.5rem' }}
                  >
                    {prefix}
                  </span>
                  <span style={{ color: isMoving ? '#B91C1C' : '#333' }}>
                    {yao}
                    {isMoving && <span className="ml-1 text-xs" style={{ color: 'var(--color-gold)' }}>← 动爻</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr style={{ borderColor: 'var(--color-border-warm)' }} />

      {/* 关联卦 */}
      <div>
        <SectionTitle>关联卦</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <SmallGuaCard hexagram={result.mutual} label="互卦" />
          <SmallGuaCard hexagram={result.reversed} label="错卦" />
          <SmallGuaCard hexagram={result.flipped} label="综卦" />
        </div>
      </div>

      {/* 笔画详情（文字起卦时） */}
      {result.strokeDetails && result.strokeDetails.length > 0 && (
        <>
          <hr style={{ borderColor: 'var(--color-border-warm)' }} />
          <div>
            <SectionTitle>笔画详情</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.strokeDetails.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex flex-col items-center px-2 py-1 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--color-parchment)',
                    border: '1px solid var(--color-border-warm)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}>
                    {d.char}
                  </span>
                  <span className="text-xs" style={{ color: d.estimated ? '#C23B22' : '#666' }}>
                    {d.strokes}画
                  </span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
//  子组件
// ============================================================

function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="text-sm px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border-warm)' }}
    >
      <span style={{ color: '#999' }}>{label}：</span>
      <span style={{ color: 'var(--color-primary-dark)' }}>{value}</span>
    </span>
  );
}

function HexagramCard({
  hexagram, label, movingLine, tiGua, yongGua,
}: {
  hexagram: { name: string; alias: string; lines: boolean[]; upperTrigram: { name: string; element: string }; lowerTrigram: { name: string; element: string } };
  label: string;
  movingLine?: number;
  tiGua?: string;
  yongGua?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>{label}</span>
      <GuaSymbol lines={hexagram.lines} movingLine={movingLine} size="lg" />
      <span
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-cinnabar)' }}
      >
        {hexagram.name}
      </span>
      <div className="flex gap-1 text-xs">
        <span style={{ color: 'var(--color-primary-dark)' }}>
          {hexagram.upperTrigram.name}
          {tiGua === hexagram.upperTrigram.name && <span className="text-green-700">（体）</span>}
          {yongGua === hexagram.upperTrigram.name && <span className="text-red-700">（用）</span>}
        </span>
        <span style={{ color: '#999' }}>/</span>
        <span style={{ color: 'var(--color-primary-dark)' }}>
          {hexagram.lowerTrigram.name}
          {tiGua === hexagram.lowerTrigram.name && <span className="text-green-700">（体）</span>}
          {yongGua === hexagram.lowerTrigram.name && <span className="text-red-700">（用）</span>}
        </span>
      </div>
    </div>
  );
}

function SmallGuaCard({ hexagram, label }: {
  hexagram: { name: string; lines: boolean[]; upperTrigram: { element: string }; lowerTrigram: { element: string } };
  label: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
      style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border-warm)' }}
    >
      <span className="text-xs font-medium" style={{ color: '#999' }}>{label}</span>
      <GuaSymbol lines={hexagram.lines} size="sm" />
      <span
        className="text-sm font-bold text-center"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {hexagram.name}
      </span>
      <div className="flex gap-1">
        <WxTag element={hexagram.upperTrigram.element} />
        <WxTag element={hexagram.lowerTrigram.element} />
      </div>
    </div>
  );
}
