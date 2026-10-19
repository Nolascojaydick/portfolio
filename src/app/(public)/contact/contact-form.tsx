"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendMessage, type ContactState } from "./actions";

const input = "mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});

  if (state.ok) {
    return (
      <div role="status" className="rounded-card border border-ok/40 bg-ok/10 p-6">
        <p className="font-medium">Message sent</p>
        <p className="mt-1 text-sm text-muted">Thanks for reaching out. I'll reply by email.</p>
      </div>
    );
  }

  const fields = [
    ["name", "Name", "text", "name"], ["email", "Email", "email", "email"], ["subject", "Subject", "text", ""],
  ] as const;

  return (
    <form action={action} className="space-y-5" noValidate>
      {fields.map(([name, label, type, auto]) => (
        <div key={name}>
          <label htmlFor={name} className="text-sm font-medium">{label}</label>
          <input id={name} name={name} type={type} autoComplete={auto || undefined} required
            defaultValue={state.values?.[name]} aria-invalid={!!state.fieldErrors?.[name] || undefined} className={input} />
          {state.fieldErrors?.[name] && <p role="alert" className="mt-1 text-sm text-danger">{state.fieldErrors[name]}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea id="message" name="message" rows={6} required defaultValue={state.values?.message}
          aria-invalid={!!state.fieldErrors?.message || undefined} className={input} />
        {state.fieldErrors?.message && <p role="alert" className="mt-1 text-sm text-danger">{state.fieldErrors.message}</p>}
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <p role="alert" className="rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
