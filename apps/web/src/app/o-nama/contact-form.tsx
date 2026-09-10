"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { Label } from "@web-shop/ui/components/label";
import { Textarea } from "@web-shop/ui/components/textarea";
import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

export default function ContactForm() {
	const [form, setForm] = useState({ name: "", email: "", message: "" });

	const sendMessage = useMutation(
		trpc.contact.send.mutationOptions({
			onSuccess: () => {
				toast.success("Poruka je poslata, javićemo vam se uskoro.");
				setForm({ name: "", email: "", message: "" });
			},
			onError: () => {
				toast.error(
					"Poruka nije poslata, proverite podatke i pokušajte ponovo.",
				);
			},
		}),
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				sendMessage.mutate(form);
			}}
			className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-6"
		>
			<div className="space-y-2">
				<Label htmlFor="contact-name">Ime</Label>
				<Input
					id="contact-name"
					required
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="contact-email">Email</Label>
				<Input
					id="contact-email"
					type="email"
					required
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="contact-message">Poruka</Label>
				<Textarea
					id="contact-message"
					required
					value={form.message}
					onChange={(e) => setForm({ ...form, message: e.target.value })}
				/>
			</div>
			<Button
				type="submit"
				className="rounded-full"
				disabled={sendMessage.isPending}
			>
				{sendMessage.isPending ? "Slanje..." : "Pošalji poruku"}
			</Button>
		</form>
	);
}
