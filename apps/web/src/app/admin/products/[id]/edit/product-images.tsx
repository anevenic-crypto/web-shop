"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

type ProductImage = {
	id: string;
	url: string;
};

export default function ProductImages({
	productId,
	images,
}: {
	productId: string;
	images: ProductImage[];
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const addImage = useMutation(
		trpc.products.addImage.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.products.getById.queryKey({ id: productId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.products.list.queryKey(),
				});
			},
		}),
	);

	const removeImage = useMutation(
		trpc.products.removeImage.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.products.getById.queryKey({ id: productId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.products.list.queryKey(),
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
			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.error ?? "Otpremanje nije uspelo");
			}
			const { key, url } = await response.json();
			await addImage.mutateAsync({ productId, key, url });
			toast.success("Slika je otpremljena");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Otpremanje nije uspelo",
			);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	}

	return (
		<div>
			<h2 className="mb-2 font-medium text-lg">Slike</h2>
			<div className="mb-4 flex flex-wrap gap-3">
				{images.map((image) => (
					<div key={image.id} className="relative">
						<img src={image.url} alt="" className="size-24 object-cover" />
						<Button
							type="button"
							variant="destructive"
							size="icon-xs"
							className="absolute -top-2 -right-2"
							onClick={() => removeImage.mutate({ id: image.id })}
						>
							×
						</Button>
					</div>
				))}
				{images.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Nema još otpremljenih slika.
					</p>
				)}
			</div>
			<div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleFileChange}
					disabled={isUploading}
					className="text-sm"
				/>
				{isUploading && (
					<p className="mt-1 text-muted-foreground text-xs">Otpremanje...</p>
				)}
			</div>
		</div>
	);
}
