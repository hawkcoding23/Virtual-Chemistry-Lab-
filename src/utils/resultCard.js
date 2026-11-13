const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const FONT = 'Arial, "Noto Sans", sans-serif';

function wrapText(context, text, maxWidth) {
  const words = String(text ?? "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  if (line) lines.push(line);
  return lines;
}

function createCardBlob(result) {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not create the result image.");

    const background = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    background.addColorStop(0, "#0b202b");
    background.addColorStop(1, "#174453");
    context.fillStyle = background;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    context.fillStyle = "#55c1aa";
    context.fillRect(0, 0, CARD_WIDTH, 12);
    context.globalAlpha = 0.18;
    context.beginPath();
    context.arc(1090, 110, 190, 0, Math.PI * 2);
    context.fillStyle = "#6ed9c4";
    context.fill();
    context.globalAlpha = 1;

    context.fillStyle = "#87dfd0";
    context.font = `700 19px ${FONT}`;
    context.letterSpacing = "3px";
    context.fillText("CHEMISTRY WORLD", 70, 76);
    context.letterSpacing = "0px";
    context.fillStyle = "#9eb9b8";
    context.font = `700 16px ${FONT}`;
    context.fillText(`${result.kind === "quiz" ? "QUIZ RESULT" : "REACTION RESULT"}  ·  CLASS ${result.classLevel ?? "9–12"}`, 70, 121);
    context.fillStyle = "#f2f8f5";
    context.font = `700 42px ${FONT}`;
    const titleLines = wrapText(context, result.title ?? "Chemistry result", 1060).slice(0, 2);
    titleLines.forEach((line, index) => context.fillText(line, 70, 184 + index * 50));

    let y = 300;
    if (result.subtitle) {
      context.fillStyle = "#8fe0d2";
      context.font = `600 26px ${FONT}`;
      wrapText(context, result.subtitle, 1060).slice(0, 2).forEach((line) => {
        context.fillText(line, 70, y);
        y += 38;
      });
      y += 10;
    }
    context.fillStyle = "#d1e0dd";
    context.font = `22px ${FONT}`;
    for (const detail of (result.details ?? []).slice(0, 5)) {
      const lines = wrapText(context, detail, 1040);
      lines.forEach((line) => {
        if (y <= 516) context.fillText(line, 70, y);
        y += 32;
      });
      y += 5;
    }

    context.strokeStyle = "#ffffff2b";
    context.beginPath();
    context.moveTo(70, 558);
    context.lineTo(1130, 558);
    context.stroke();
    context.fillStyle = "#a8c1be";
    context.font = `600 18px ${FONT}`;
    context.fillText(`Made by ${result.username || "Guest explorer"}`, 70, 595);
    context.textAlign = "right";
    context.fillText(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 1130, 595);
    context.textAlign = "left";
    const encoded = canvas.toDataURL("image/png").split(",")[1];
    const binary = window.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: "image/png" });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function saveResultCard(result) {
  const blob = createCardBlob(result);
  downloadBlob(blob, `chemistry-world-${result.kind ?? "result"}.png`);
  return "saved";
}

export async function shareResultCard(result) {
  const blob = createCardBlob(result);
  const file = new File([blob], `chemistry-world-${result.kind ?? "result"}.png`, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: result.title ?? "Chemistry World result",
        text: `Class ${result.classLevel ?? "9–12"} · ${result.username || "Guest explorer"}`,
        files: [file],
      });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }
  downloadBlob(blob, file.name);
  return "saved";
}
