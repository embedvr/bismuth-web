import { z } from 'zod';

export const formSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(16)
		.trim()
		.regex(/^[a-zA-Z0-9_]+$/)
});

export type FormSchema = typeof formSchema;
