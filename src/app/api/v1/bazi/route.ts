import { ok, fail, parseBody, requireFields } from '../_shared';
import { getBaziResult, buildDaYunResult, analyzeFourDimensions, computeDynamicWuxing, buildLiuNianList } from '@/lib/lunar';
import { getBaziInterpretation } from '@/lib/bazi-interpretation';

/**
 * POST /api/v1/bazi
 *
 * 八字排盘 — 四柱、大运、十维度解读
 *
 * Body: { year, month, day, hour, gender? (1男0女, 默认1) }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const missing = requireFields(body, ['year', 'month', 'day', 'hour']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const { year, month, day, hour, gender = 1 } = body as {
    year: number; month: number; day: number; hour: number; gender?: number;
  };

  try {
    const baziResult = getBaziResult(year, month, day, hour);
    const daYunResult = buildDaYunResult(year, month, day, hour, gender, baziResult);
    const fourDim = analyzeFourDimensions(baziResult, gender);
    const interpretation = getBaziInterpretation(baziResult, daYunResult, gender);

    // 计算动态五行（用于前端的五行力量图）
    const currentYear = new Date().getFullYear();
    const currentIdx = daYunResult?.daYunList?.findIndex((dy) => currentYear >= dy.startYear && currentYear <= dy.endYear) ?? -1;
    const selectedDaYun = currentIdx >= 0 ? daYunResult.daYunList[currentIdx] : (daYunResult.daYunList[0] ?? null);
    let currentLiuNian = null;
    if (selectedDaYun) {
      const liuNianList = buildLiuNianList(selectedDaYun, baziResult);
      currentLiuNian = liuNianList.find((ln) => ln.year === currentYear) ?? null;
    }

    const dynamicWuxing = computeDynamicWuxing(baziResult, selectedDaYun, currentLiuNian);

    return ok({
      bazi: baziResult,
      daYun: daYunResult,
      fourDimensions: fourDim,
      interpretation,
      dynamicWuxing,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '排盘失败', 500);
  }
}
