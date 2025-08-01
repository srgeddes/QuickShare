import { z } from "zod";

export const createQuickShareSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	imageKey: z.string().optional(),
});

export type CreateQuickShareInput = z.infer<typeof createQuickShareSchema>;
