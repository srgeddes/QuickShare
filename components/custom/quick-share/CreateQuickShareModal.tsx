"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createQuickShareSchema, CreateQuickShareInput } from "@/lib/validation/quick-share.schema";
import { useState } from "react";
import { toast } from "sonner";

export function CreateQuickShareModal({ onSuccess }: { onSuccess?: () => void }) {
	const [open, setOpen] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<CreateQuickShareInput>({
		resolver: zodResolver(createQuickShareSchema),
	});

	const onSubmit = async (data: CreateQuickShareInput) => {
		try {
			const res = await fetch("/api/quick-share", {
				method: "POST",
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				const json = await res.json();
				throw new Error(json.error ?? "Failed to create QuickShare");
			}

			toast.success("QuickShare created!");
			onSuccess?.();
			reset();
			setOpen(false);
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="absolute top-4 right-4">Create QuickShare</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create QuickShare</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Input placeholder="Title" {...register("title")} />
						{errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
					</div>

					<div>
						<Textarea placeholder="Description" {...register("description")} />
						{errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
					</div>

					<div>
						<Input placeholder="Image Key (optional)" {...register("imageKey")} />
					</div>

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
