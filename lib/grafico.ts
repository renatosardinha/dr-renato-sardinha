/** Caminho suave (SVG) para uma série de valores. Usado nos gráficos do painel. */
export function curva(valores: number[], w: number, h: number, pad: number, max: number) {
  const n = valores.length;
  if (n === 0) return { d: '', pts: [] as [number, number][] };
  const passo = n > 1 ? w / (n - 1) : 0;
  const pts = valores.map((v, i): [number, number] => [i * passo, h - pad - (Math.max(0, v) / Math.max(1, max)) * (h - pad * 2)]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    const mx = (pts[i - 1][0] + pts[i][0]) / 2;
    d += ` C${mx.toFixed(1)} ${pts[i - 1][1].toFixed(1)} ${mx.toFixed(1)} ${pts[i][1].toFixed(1)} ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  }
  return { d, pts };
}
