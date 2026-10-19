import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  subject: z.string().trim().min(1, "Enter a subject").max(200)
    .refine((s) => !/[\r\n]/.test(s), "Subject must be a single line"),
  message: z.string().trim().min(10, "Write at least 10 characters").max(5000),
});
