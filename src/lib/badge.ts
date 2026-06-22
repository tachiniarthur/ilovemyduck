// Generates a cute "N/total" sequence badge as a PNG, drawn on a canvas so we
// keep full control over the duck look & feel (no font files needed inside
// FFmpeg). The PNG is composited onto each re-encoded part via FFmpeg overlay.

// Duck palette (mirrors tailwind.config.ts).
const DUCK_YELLOW = "#ffc41f";
const BILL_ORANGE = "#ff7a18";
const BILL_DARK = "#a86d00";

/**
 * Render a rounded "index/total" pill sized for a 1080-wide Stories canvas.
 * Returns the encoded PNG bytes, ready to write into the FFmpeg FS.
 */
export async function buildPartBadge(index: number, total: number): Promise<Uint8Array> {
  const text = `${index}/${total}`;

  // Generous scale so the pill stays crisp on a 1080x1920 canvas.
  const fontSize = 52;
  const padX = 38;
  const padY = 22;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível para o selo das partes.");

  // Measure text first so the pill hugs it.
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const textWidth = ctx.measureText(text).width;

  const width = Math.ceil(textWidth + padX * 2);
  const height = Math.ceil(fontSize + padY * 2);
  canvas.width = width;
  canvas.height = height;

  // Re-apply font after resizing (resize resets the context state).
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Rounded pill with a soft shadow + bill-orange border.
  const radius = height / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, 0, 0, width, height, radius);
  ctx.fillStyle = DUCK_YELLOW;
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 5;
  ctx.strokeStyle = BILL_ORANGE;
  roundedRect(ctx, 2.5, 2.5, width - 5, height - 5, radius - 2.5);
  ctx.stroke();

  ctx.fillStyle = BILL_DARK;
  ctx.fillText(text, width / 2, height / 2 + 2);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Não consegui desenhar o selo da parte.");

  return new Uint8Array(await blob.arrayBuffer());
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
