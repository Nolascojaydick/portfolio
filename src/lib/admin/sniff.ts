// Detect file types from their first bytes, never from the client-supplied name or MIME type.
const at = (b: Uint8Array, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);

export function sniffImage(b: Uint8Array): { mime: string; ext: string } | null {
  if (at(b, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (at(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (at(b, [0x52, 0x49, 0x46, 0x46]) && at(b, [0x57, 0x45, 0x42, 0x50], 8)) return { mime: "image/webp", ext: "webp" };
  if (at(b, [0x66, 0x74, 0x79, 0x70], 4) && (at(b, [0x61, 0x76, 0x69, 0x66], 8) || at(b, [0x61, 0x76, 0x69, 0x73], 8)))
    return { mime: "image/avif", ext: "avif" };
  return null;
}

export const isPdf = (b: Uint8Array) => at(b, [0x25, 0x50, 0x44, 0x46, 0x2d]);
