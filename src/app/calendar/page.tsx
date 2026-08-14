'use client';

import { useState, useMemo } from 'react';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import DayDetail from '@/components/calendar/DayDetail';
import ChengGuCard from '@/components/calendar/ChengGuCard';
import CompactBazi from '@/components/calendar/CompactBazi';
import LuckyDirection from '@/components/calendar/LuckyDirection';
import DailyLesson from '@/components/calendar/DailyLesson';
import ZejiSection from '@/components/calendar/ZejiSection';
import {
  getCalendarInfo,
  getChengGu,
  getHourZhi,
  getShiChen,
} from '@/lib/lunar';
import { getYuXiaInfo } from '@/lib/yuxia';

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i === 0 ? 23 : (i * 2) - 1;
  return { value: h, label: getShiChen(h) };
});

// 将 0-23 小时映射为代表该时辰的小时（用于 select 值匹配和展示）
function toRepresentativeHour(hour: number) {
  const idx = Math.floor(((hour + 1) % 24) / 2);
  return idx === 0 ? 23 : idx * 2 - 1;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  // const [hour, setHour] = useState(now.getHours());
  const [hour, setHour] = useState(toRepresentativeHour(now.getHours()));

  // 日期输入
  const [inputYear, setInputYear] = useState(String(year));
  const [inputMonth, setInputMonth] = useState(String(month));
  const [inputDay, setInputDay] = useState(String(day));

  const calendarData = useMemo(
    () => getCalendarInfo(year, month, day, hour),
    [year, month, day, hour],
  );

  const chengGuData = useMemo(() => {
    const hourZhi = getHourZhi(hour);
    return getChengGu(
      calendarData.yearGanZhi,
      calendarData.lunarMonth,
      calendarData.lunarDay,
      hourZhi,
    );
  }, [calendarData, hour]);

  const yuxiaData = useMemo(
    () => getYuXiaInfo(year, month, day),
    [year, month, day],
  );

  const handleDateSubmit = () => {
    const y = parseInt(inputYear);
    const m = parseInt(inputMonth);
    const d = parseInt(inputDay);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    // setHour(now.getHours());
    setHour(toRepresentativeHour(now.getHours()));
    setInputYear(String(now.getFullYear()));
    setInputMonth(String(now.getMonth() + 1));
    setInputDay(String(now.getDate()));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="section-title text-2xl">玉匣通书</h1>
        <p className="text-base text-[var(--color-ink-light)] mt-2">
          支持公历农历互查、四柱八字、纳音五行、节气宜忌、民俗择吉、穿衣指南
        </p>
      </div>

      {/* 日期输入区 */}
      <div className="card-chinese p-4 mb-6">
        <div className="flex flex-wrap items-end justify-center gap-3">
          <div>
            <label className="form-label">年</label>
            <input
              type="number"
              value={inputYear}
              onChange={(e) => setInputYear(e.target.value)}
              min={1900}
              max={2100}
              className="form-input w-24"
            />
          </div>
          <div>
            <label className="form-label">月</label>
            <input
              type="number"
              value={inputMonth}
              onChange={(e) => setInputMonth(e.target.value)}
              min={1}
              max={12}
              className="form-input w-20"
            />
          </div>
          <div>
            <label className="form-label">日</label>
            <input
              type="number"
              value={inputDay}
              onChange={(e) => setInputDay(e.target.value)}
              min={1}
              max={31}
              className="form-input w-20"
            />
          </div>
          <div>
            <label className="form-label">时辰</label>
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="form-input"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleDateSubmit} className="btn-primary">
            查询
          </button>
          <button onClick={handleToday} className="btn-outline">
            今天
          </button>
        </div>
      </div>

      {/* 紧凑四柱 */}
      <CompactBazi data={calendarData} />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：月历 + 吉祥方位 + 称骨论命 + 国学小课堂 */}
        <div className="lg:col-span-4 space-y-6">
          <MiniCalendar
            year={year}
            month={month}
            selectedDay={day}
            onSelectDay={(d) => {
              setDay(d);
              setInputDay(String(d));
            }}
            onChangeMonth={(y, m) => {
              setYear(y);
              setMonth(m);
              setInputYear(String(y));
              setInputMonth(String(m));
            }}
          />
          <LuckyDirection dayGan={calendarData.dayGanZhi[0]} />
          <ChengGuCard data={chengGuData} />
          <DailyLesson
            keyword={yuxiaData.dailyKeyword}
            quiz={yuxiaData.dailyQuiz}
          />
        </div>

        {/* 右侧详情 */}
        <div className="lg:col-span-8 space-y-6">
          <DayDetail data={calendarData} />
          <ZejiSection
            year={year}
            month={month}
            day={day}
          />
        </div>
      </div>
    </div>
  );
}
