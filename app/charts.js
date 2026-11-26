// Hand-drawn canvas charts for HomeLedger. No chart library: the donut
// and the bucket bars are painted directly on 2d canvas contexts.
function fitCanvas(canvas) {
  const cssHeight = canvas.getAttribute("height");
  if (cssHeight) canvas.style.height = cssHeight + "px";
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawDonut(canvas, slices, centerText) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 6;
  const inner = outer * 0.62;
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fillStyle = "#b8c2cc";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    if (slice.value <= 0) continue;
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  if (centerText && centerText.length >= 2) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#0f2a43";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(centerText[0], cx, cy - 10);
    ctx.fillStyle = "#6b7683";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(centerText[1], cx, cy + 12);
  }
}

function drawBucketBars(canvas, buckets) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const leftMargin = 96;
  const rightMargin = 132;
  const plotX = leftMargin;
  const plotWidth = width - leftMargin - rightMargin;
  const rowHeight = height / buckets.length;
  const barHeight = Math.min(20, rowHeight / 2);
  buckets.forEach((bucket, i) => {
    const y = rowHeight * i + rowHeight / 2;
    const barY = y - barHeight / 2;
    ctx.textAlign = "right";
    ctx.fillStyle = "#33414f";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(bucket.label, plotX - 10, y + 4);
    ctx.fillStyle = "#e8e2d2";
    roundRect(ctx, plotX, barY, plotWidth, barHeight, 4);
    ctx.fill();
    const fillWidth = Math.max(2, Math.min(1, bucket.actual / 100) * plotWidth);
    ctx.fillStyle = bucket.color;
    roundRect(ctx, plotX, barY, fillWidth, barHeight, 4);
    ctx.fill();
    const markerX = plotX + (bucket.target / 100) * plotWidth;
    ctx.fillStyle = "#0f2a43";
    ctx.fillRect(markerX - 1, barY - 4, 2, barHeight + 8);
    ctx.textAlign = "left";
    ctx.fillStyle = "#0f2a43";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(Math.round(bucket.actual) + "% (target " + bucket.target + "%)", plotX + plotWidth + 10, y + 4);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
