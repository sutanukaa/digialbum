// Client-side photo helpers shared by both editors.

// Decode a blob into an <img>, downscale to ≤1600px, JPEG-compress. Keeps the
// draft in localStorage small and the save request under Vercel's 4.5MB limit.
// ponytail: full-res originals are never kept; bump 1600/0.8 if quality complaints.
function drawToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read image"));
    };
    img.src = url;
  });
}

// HEIC (iPhone) photos can't be decoded by browsers — convert to JPEG first.
// heic2any is ~1MB, so it's only loaded when actually needed.
async function heicToJpeg(blob: Blob): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const out = await heic2any({ blob, toType: "image/jpeg", quality: 0.8 });
  return Array.isArray(out) ? out[0] : out;
}

export async function fileToDataUrl(file: File): Promise<string> {
  const isHeic = /\.hei[cf]$/i.test(file.name) || /hei[cf]/i.test(file.type);
  try {
    return await drawToDataUrl(isHeic ? await heicToJpeg(file) : file);
  } catch {
    // extension lied (e.g. HEIC saved as .jpg) — try converting before giving up
    if (!isHeic) return drawToDataUrl(await heicToJpeg(file));
    throw new Error("could not read image");
  }
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
