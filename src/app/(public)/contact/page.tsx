import type { Metadata } from "next";
import { getProfile } from "@/lib/data";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const p = await getProfile();
  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">Contact</h1>
      <p className="mt-3 max-w-xl text-muted">
        Tell me about the project or the role.
        {p.public_email && <> You can also email <a className="text-accent underline" href={`mailto:${p.public_email}`}>{p.public_email}</a>.</>}
      </p>
      <div className="relative mt-8 max-w-xl"><ContactForm /></div>
    </>
  );
}
