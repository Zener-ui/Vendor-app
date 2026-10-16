// Shrinks large phone photos before upload. A 12 MP camera photo is 4-10 MB:
// over mobile data that exceeds the old 15 s request timeout, and anything above
// 8 MB is rejected by the server. Output is a JPEG no longer than 1600 px.
const MAX_SIDE = 1600;
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

export async function compressImage(file) {
  try {
    if (!file || !file.type || !file.type.startsWith("image/") || typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    if (file.size <= SKIP_BELOW_BYTES && longest <= MAX_SIDE) {
      bitmap.close?.();
      return file;
    }
    const scale = Math.min(1, MAX_SIDE / longest);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // JPEG has no transparency
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = `${(file.name || "photo").replace(/\.[^.]+$/, "")}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file; // never block an upload because compression failed
  }
}
