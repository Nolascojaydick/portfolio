import { describe, expect, it } from "vitest";
import { buildSchema, getResource, slugify } from "@/lib/admin/resources";
import { contactSchema } from "@/lib/validations/contact";
import { isPdf, sniffImage } from "@/lib/admin/sniff";

const bytes = (...n: number[]) => new Uint8Array([...n, ...new Array(16).fill(0)]);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("slugify", () => {
  it("builds clean URL slugs", () => {
    expect(slugify("My Cool App!")).toBe("my-cool-app");
    expect(slugify("  Café — Ünïcode  ")).toBe("cafe-unicode");
    expect(slugify("???")).toBe("");
  });
});

describe("project validation", () => {
  const schema = buildSchema(getResource("projects")!);
  const valid = {
    title: "My App", slug: "my-app", short_description: "", description: "", cover_image_url: "",
    repository_url: "", live_demo_url: "", category: "", display_order: "", featured: false, published: true,
  };

  it("accepts a valid project and fills defaults", () => {
    const r = schema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.display_order).toBe(0);
      expect(r.data.cover_image_url).toBeNull();
      expect(r.data.short_description).toBe("");
    }
  });
  it("rejects an empty title", () => expect(schema.safeParse({ ...valid, title: "" }).success).toBe(false));
  it("rejects an invalid slug", () => expect(schema.safeParse({ ...valid, slug: "Bad Slug" }).success).toBe(false));
  it("rejects non-http URLs", () => {
    expect(schema.safeParse({ ...valid, repository_url: "javascript:alert(1)" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, live_demo_url: "https://example.com" }).success).toBe(true);
  });
});

describe("experience rules", () => {
  const r = getResource("experience")!;
  it("needs an end date unless current", () => {
    expect(r.validate!({ is_current: false, end_date: null, start_date: "2023-01-01" })).toBeTruthy();
    expect(r.validate!({ is_current: true, end_date: null, start_date: "2023-01-01" })).toBeNull();
  });
  it("rejects an end date before the start date", () => {
    expect(r.validate!({ is_current: false, start_date: "2023-05-01", end_date: "2023-01-01" })).toBeTruthy();
  });
  it("clears the end date for a current job", () => {
    const v: Record<string, any> = { is_current: true, end_date: "2024-01-01" };
    r.normalize!(v);
    expect(v.end_date).toBeNull();
  });
});

describe("contact validation", () => {
  const ok = { name: "Ana", email: "ana@example.com", subject: "Hello", message: "I'd like to talk about a project." };
  it("accepts a valid message", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("rejects a bad email", () => expect(contactSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false));
  it("rejects a too-short message", () => expect(contactSchema.safeParse({ ...ok, message: "hi" }).success).toBe(false));
  it("rejects a message over 5000 characters", () => expect(contactSchema.safeParse({ ...ok, message: "x".repeat(5001) }).success).toBe(false));
  it("rejects newlines in the subject", () => expect(contactSchema.safeParse({ ...ok, subject: "a\nBcc: x@y.z" }).success).toBe(false));
});

describe("file sniffing", () => {
  it("recognises real image formats", () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff))?.mime).toBe("image/jpeg");
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
    expect(sniffImage(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))?.mime).toBe("image/webp");
    expect(sniffImage(bytes(0, 0, 0, 0, ...ascii("ftypavif")))?.mime).toBe("image/avif");
  });
  it("rejects disguised files", () => {
    expect(sniffImage(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
    expect(sniffImage(new Uint8Array(0))).toBeNull();
  });
  it("detects PDFs", () => {
    expect(isPdf(new TextEncoder().encode("%PDF-1.7 ..."))).toBe(true);
    expect(isPdf(new TextEncoder().encode("MZ executable"))).toBe(false);
  });
});
