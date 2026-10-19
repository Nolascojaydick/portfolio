import { z } from "zod";

export type FieldType =
  | "text" | "textarea" | "markdown" | "url" | "email" | "number" | "date" | "checkbox" | "select" | "slug" | "image" | "resume";

export type Field = {
  name: string; label: string; type: FieldType;
  required?: boolean; options?: string[]; max?: number; min?: number;
  default?: string | number; help?: string; bucket?: string;
};

export type Resource = {
  key: string; table: string; title: string; singular: string; titleField: string;
  fields: Field[];
  columns: string[];
  order: { col: string; asc: boolean }[];
  slugFrom?: string;
  toggles?: ("published" | "featured")[];
  publishedAt?: string;
  tags?: { junction: string; fk: string; label: string };
  publicPath?: (row: any) => string;
  singleton?: boolean;
  normalize?: (v: Record<string, any>) => void;
  validate?: (v: Record<string, any>) => string | null;
};

const SKILL_CATEGORIES = [
  "Frontend development", "Backend development", "Databases",
  "DevOps and deployment", "Tools and technologies",
];

const sortFields: Field = { name: "display_order", label: "Display order", type: "number", default: 0, help: "Lower numbers appear first." };

export const resources: Resource[] = [
  {
    key: "projects", table: "projects", title: "Projects", singular: "project", titleField: "title",
    slugFrom: "title", toggles: ["published", "featured"], publishedAt: "published_at",
    columns: ["title", "category", "published", "featured"],
    order: [{ col: "created_at", asc: false }],
    tags: { junction: "project_tags", fk: "project_id", label: "Technologies" },
    publicPath: (r) => `/projects/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave blank to build it from the title." },
      { name: "short_description", label: "Short description", type: "textarea", max: 300 },
      { name: "description", label: "Full description", type: "markdown", help: "Markdown supported. Use headings for challenges and solutions." },
      { name: "cover_image_url", label: "Cover image", type: "image", bucket: "project-images" },
      { name: "repository_url", label: "GitHub repository URL", type: "url" },
      { name: "live_demo_url", label: "Live demo URL", type: "url" },
      { name: "category", label: "Category", type: "text", max: 60 },
      sortFields,
      { name: "featured", label: "Featured on the home page", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  {
    key: "skills", table: "skills", title: "Skills", singular: "skill", titleField: "name",
    columns: ["name", "category", "display_order"],
    order: [{ col: "category", asc: true }, { col: "display_order", asc: true }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 60 },
      { name: "category", label: "Category", type: "select", required: true, options: SKILL_CATEGORIES },
      { name: "icon", label: "Icon name", type: "text", max: 60 },
      { name: "proficiency_level", label: "Proficiency (1 to 5, optional)", type: "number", min: 1, max: 5 },
      sortFields,
    ],
  },
  {
    key: "experience", table: "experience", title: "Experience", singular: "experience entry", titleField: "job_title",
    columns: ["job_title", "company", "start_date", "is_current"],
    order: [{ col: "is_current", asc: false }, { col: "start_date", asc: false }],
    fields: [
      { name: "job_title", label: "Job title", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "employment_type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"] },
      { name: "description", label: "Description", type: "textarea", max: 2000 },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date" },
      { name: "is_current", label: "I currently work here", type: "checkbox" },
      sortFields,
    ],
    normalize: (v) => { if (v.is_current) v.end_date = null; },
    validate: (v) =>
      !v.is_current && !v.end_date ? "Add an end date, or mark this as your current position."
      : v.end_date && v.end_date < v.start_date ? "The end date can't be before the start date." : null,
  },
  {
    key: "education", table: "education", title: "Education", singular: "education entry", titleField: "degree",
    columns: ["degree", "institution", "end_date"],
    order: [{ col: "display_order", asc: true }, { col: "end_date", asc: false }],
    fields: [
      { name: "degree", label: "Degree or qualification", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "field_of_study", label: "Field of study", type: "text" },
      { name: "description", label: "Description", type: "textarea", max: 2000 },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "credential_url", label: "Credential URL", type: "url" },
      sortFields,
    ],
  },
  {
    key: "certifications", table: "certifications", title: "Certifications", singular: "certification", titleField: "name",
    columns: ["name", "issuing_organization", "issue_date"],
    order: [{ col: "display_order", asc: true }, { col: "issue_date", asc: false }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "issuing_organization", label: "Issuing organization", type: "text", required: true },
      { name: "issue_date", label: "Issue date", type: "date" },
      { name: "expiration_date", label: "Expiration date", type: "date" },
      { name: "credential_url", label: "Credential URL", type: "url" },
      sortFields,
    ],
  },
  {
    key: "blog", table: "blog_posts", title: "Blog", singular: "post", titleField: "title",
    slugFrom: "title", toggles: ["published"], publishedAt: "published_at",
    columns: ["title", "published", "published_at"],
    order: [{ col: "created_at", asc: false }],
    tags: { junction: "post_tags", fk: "post_id", label: "Tags" },
    publicPath: (r) => `/blog/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave blank to build it from the title." },
      { name: "excerpt", label: "Excerpt", type: "textarea", max: 400 },
      { name: "content", label: "Content", type: "markdown", help: "Markdown supported. Raw HTML is not rendered." },
      { name: "cover_image_url", label: "Cover image", type: "image", bucket: "blog-images" },
      { name: "published_at", label: "Publication date", type: "date", help: "Leave blank to use today when you publish." },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  {
    key: "profile", table: "profiles", title: "Profile", singular: "profile", titleField: "display_name",
    singleton: true, columns: [], order: [],
    fields: [
      { name: "display_name", label: "Name", type: "text", required: true },
      { name: "professional_title", label: "Professional title", type: "text", required: true },
      { name: "biography", label: "Biography", type: "textarea", max: 4000 },
      { name: "location", label: "Location", type: "text" },
      { name: "avatar_url", label: "Profile image", type: "image", bucket: "profile-assets" },
      { name: "resume_url", label: "Résumé (PDF)", type: "resume", help: "Stored privately. Visitors get a short-lived download link." },
      { name: "public_email", label: "Public contact email", type: "email", help: "Shown publicly on the contact page. Leave blank to hide." },
      { name: "github_url", label: "GitHub URL", type: "url" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { name: "website_url", label: "Website URL", type: "url" },
    ],
  },
];

export const getResource = (key: string) => resources.find((r) => r.key === key);
export const listable = resources.filter((r) => !r.singleton);

// ---- Zod validation built from the field definitions ----
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

function fieldSchema(f: Field): z.ZodTypeAny {
  let base: z.ZodTypeAny;
  switch (f.type) {
    case "checkbox": return z.boolean();
    case "number":
      base = z.coerce.number({ invalid_type_error: "Enter a number" })
        .int("Whole numbers only").min(f.min ?? 0).max(f.max ?? 1_000_000);
      break;
    case "date": base = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"); break;
    case "url": case "image":
      base = z.string().trim().max(500).url("Enter a full URL")
        .refine((u) => /^https?:\/\//i.test(u), "Use an http or https URL");
      break;
    case "email": base = z.string().trim().max(254).email("Enter a valid email"); break;
    case "slug":
      base = z.string().trim().max(120)
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
      break;
    case "select": base = z.enum(f.options as [string, ...string[]], { errorMap: () => ({ message: "Choose an option" }) }); break;
    case "textarea": base = z.string().trim().max(f.max ?? 2000); break;
    case "markdown": base = z.string().trim().max(f.max ?? 50000); break;
    case "resume": base = z.string().trim().max(300); break;
    default: base = z.string().trim().max(f.max ?? 200);
  }
  if (f.required) return z.preprocess((v) => blank(v) ?? undefined, base);
  // Text columns that are NOT NULL in the database fall back to an empty string.
  const empty = f.type === "textarea" || f.type === "markdown" ? "" : (f.default ?? null);
  return z.preprocess((v) => blank(v) ?? empty, base.nullable());
}

export const buildSchema = (r: Resource) =>
  z.object(Object.fromEntries(r.fields.map((f) => [f.name, fieldSchema(f)])));

export const slugify = (s: string) =>
  s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
