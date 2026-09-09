"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { Switch } from "@web-shop/ui/components/switch";
import { Textarea } from "@web-shop/ui/components/textarea";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

type Promo = {
	id: string;
	title: string;
	body: string;
	imageUrl: string | null;
	isPublished: boolean;
};

export default function PromosManager() {
	const { data: promos, isLoading } = useQuery(trpc.promos.list.queryOptions());

	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");

	const createPromo = useMutation(
		trpc.promos.create.mutationOptions({
			onSuccess: () => {
				toast.success("Dodato");
				setTitle("");
				setBody("");
				queryClient.invalidateQueries({
					queryKey: trpc.promos.list.queryKey(),
				});
			},
		}),
	);

	return (
		<div className="space-y-8">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (title.trim() && body.trim()) {
						createPromo.mutate({
							title: title.trim(),
							body: body.trim(),
							isPublished: false,
						});
					}
				}}
				className="max-w-lg space-y-3 rounded-3xl border border-border bg-card p-6 shadow-sm"
			>
				<p className="font-medium text-sm">Dodaj novi tekst / reklamu</p>
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Naslov (npr. Savet za nanošenje ruža)"
				/>
				<Textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					placeholder="Tekst..."
					rows={3}
				/>
				<Button
					type="submit"
					disabled={createPromo.isPending || !title.trim() || !body.trim()}
				>
					Dodaj
				</Button>
			</form>

			{isLoading && (
				<p className="text-muted-foreground text-sm">Učitavanje...</p>
			)}
			{!isLoading && promos?.length === 0 && (
				<p className="text-muted-foreground text-sm">
					Još uvek nema dodatih tekstova.
				</p>
			)}

			{!!promos?.length && (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
					{promos.map((promo) => (
						<PromoCard key={promo.id} promo={promo} />
					))}
				</div>
			)}
		</div>
	);
}

function PromoCard({ promo }: { promo: Promo }) {
	const [title, setTitle] = useState(promo.title);
	const [body, setBody] = useState(promo.body);
	const [isPublished, setIsPublished] = useState(promo.isPublished);
	const [isUploading, setIsUploading] = useState(false);

	const updatePromo = useMutation(
		trpc.promos.update.mutationOptions({
			onSuccess: () => {
				toast.success("Sačuvano");
				queryClient.invalidateQueries({
					queryKey: trpc.promos.list.queryKey(),
				});
			},
		}),
	);

	const setImage = useMutation(
		trpc.promos.setImage.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.promos.list.queryKey(),
				});
			},
		}),
	);

	const deletePromo = useMutation(
		trpc.promos.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Obrisano");
				queryClient.invalidateQueries({
					queryKey: trpc.promos.list.queryKey(),
				});
			},
		}),
	);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "promos");
			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				const errBody = await response.json().catch(() => null);
				throw new Error(errBody?.error ?? "Otpremanje nije uspelo");
			}
			const { key, url } = await response.json();
			await setImage.mutateAsync({
				id: promo.id,
				imageKey: key,
				imageUrl: url,
			});
			toast.success("Slika je otpremljena");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Otpremanje nije uspelo",
			);
		} finally {
			setIsUploading(false);
			e.target.value = "";
		}
	}

	return (
		<div className="flex flex-col gap-3 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
			<div className="aspect-video w-full overflow-hidden bg-muted">
				{promo.imageUrl ? (
					<img
						src={promo.imageUrl}
						alt={promo.title}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground text-xs">
						Bez slike
					</div>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<Input value={title} onChange={(e) => setTitle(e.target.value)} />
				<Textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					rows={3}
				/>
				<div className="flex items-center gap-2">
					<Switch checked={isPublished} onCheckedChange={setIsPublished} />
					<span className="text-muted-foreground text-sm">
						Objavljeno na početnoj
					</span>
				</div>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleFileChange}
					disabled={isUploading}
					className="text-xs"
				/>
				<div className="mt-auto flex flex-wrap gap-2 pt-2">
					<Button
						size="sm"
						disabled={updatePromo.isPending}
						onClick={() =>
							updatePromo.mutate({ id: promo.id, title, body, isPublished })
						}
					>
						Sačuvaj
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => deletePromo.mutate({ id: promo.id })}
					>
						Obriši
					</Button>
				</div>
			</div>
		</div>
	);
}
