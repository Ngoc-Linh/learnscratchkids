import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError, handler, json, requireAdmin } from "@/lib/api";

export const POST = handler(async (req) => {
  await requireAdmin();
  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) throw new ApiError("Vui lòng chọn một tệp hình ảnh", 422);
  if (file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new ApiError("Hình ảnh phải có dung lượng từ 1 byte đến 5 MB", 422);
  }

  const supportedTypes: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
    "image/png": {
      extension: "png",
      signature: (bytes) => bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte),
    },
    "image/jpeg": {
      extension: "jpg",
      signature: (bytes) => bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    },
    "image/webp": {
      extension: "webp",
      signature: (bytes) => bytes.length >= 12 &&
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
    },
  };
  const imageType = supportedTypes[file.type];
  if (!imageType) throw new ApiError("Chỉ chấp nhận ảnh PNG, JPEG hoặc WebP", 422);

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!imageType.signature(bytes)) throw new ApiError("Nội dung tệp không khớp với định dạng hình ảnh", 422);
  const filename = `${randomUUID()}.${imageType.extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "guide");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
  return json({ imageUrl: `/uploads/guide/${filename}` }, 201);
});
