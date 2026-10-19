"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validations/contact";

export type ContactState = {
  ok?: boolean; error?: string;
  fieldErrors?: Record<string, string>; values?: Record<string, string>;
};

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");

async function notify(m: { name: string; email: string; subject: string; message: string }) {
  const { RESEND_API_KEY: key, CONTACT_NOTIFY_EMAIL: to, CONTACT_FROM_EMAIL: from } = process.env;
  if (!key || !to || !from) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to, reply_to: m.email,
        subject: `New portfolio message: ${m.subject}`,
        text: `From ${m.name} <${m.email}>\n\n${m.message}`,
      }),
    });
  } catch { /* email is optional; the message is already saved */ }
}

export async function sendMessage(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const values = { name: text(fd, "name"), email: text(fd, "email"), subject: text(fd, "subject"), message: text(fd, "message") };

  if (text(fd, "website")) return { ok: true }; // honeypot: bots fill this hidden field; pretend success

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fieldErrors[String(i.path[0])] ??= i.message; });
    return { error: "Check the highlighted fields.", fieldErrors, values };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "The contact form isn't available right now. Please email me instead.", values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const ipKey = createHash("sha256").update(`${process.env.RATE_LIMIT_SALT ?? ""}${ip}`).digest("hex");

  const db = adminClient();
  const perIp = await db.rpc("check_rate_limit", { p_key: `contact:ip:${ipKey}`, p_limit: 5, p_window_seconds: 3600 });
  if (perIp.error) return { error: "Your message couldn't be sent right now. Please try again later.", values }; // fail closed
  if (!perIp.data) return { error: "You've sent several messages recently. Please try again in an hour.", values };

  const global = await db.rpc("check_rate_limit", { p_key: "contact:global", p_limit: 100, p_window_seconds: 3600 });
  if (global.error || !global.data) return { error: "The form is busy right now. Please try again later.", values };

  const { error } = await db.from("contact_messages").insert({
    sender_name: parsed.data.name, sender_email: parsed.data.email,
    subject: parsed.data.subject, message: parsed.data.message,
  });
  if (error) return { error: "Your message couldn't be sent right now. Please try again later.", values };

  await notify(parsed.data);
  return { ok: true };
}
