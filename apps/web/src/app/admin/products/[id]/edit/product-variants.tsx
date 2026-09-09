"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

type ProductVariant = {
	id: string;
	name: string;
	colorHex: string | null;
	stock: number;
};

export default function ProductVariants({
	productId,
	variants,
}: {
	productId: string;
	variants: ProductVariant[];
}) {
	const [name, setName] = useState("");
	const [colorHex, setColorHex] = useState("#c56f7a");
	const [stock, setStock] = useState(0);

	function invalidate() {
		queryClient.invalidateQueries({
			queryKey: trpc.products.getById.queryKey({ id: productId }),
		});
		queryClient.invalidateQueries({ queryKey: trpc.products.list.queryKey() });
	}

	const addVariant = useMutation(
		trpc.products.addVariant.mutationOptions({
			onSuccess: () => {
				toast.success("Nijansa je dodata");
				setName("");
				setStock(0);
				invalidate();
			},
		}),
	);

	const updateVariant = useMutation(
		trpc.products.updateVariant.mutationOptions({ onSuccess: invalidate }),
	);

	const removeVariant = useMutation(
		trpc.products.removeVariant.mutationOptions({
			onSuccess: () => {
				toast.success("Nijansa je obrisana");
				invalidate();
			},
		}),
	);

	return (
		<div>
			<h2 className="mb-2 font-medium text-lg">Nijanse</h2>
			<p className="mb-3 text-muted-foreground text-sm">
				Ako proizvod ima nijanse (npr. boju ruža), kupac bira nijansu pre nego
				što doda u korpu. Ako ne dodaš nijansu, prikazuje se samo osnovno stanje
				na lageru.
			</p>

			<div className="mb-4 space-y-2">
				{variants.map((variant) => (
					<div
						key={variant.id}
						className="flex items-center gap-3 rounded-2xl border border-border p-3"
					>
						<span
							className="size-6 shrink-0 rounded-full border"
							style={{ backgroundColor: variant.colorHex ?? "transparent" }}
						/>
						<Input
							defaultValue={variant.name}
							onBlur={(e) =>
								e.target.value !== variant.name &&
								updateVariant.mutate({
									id: variant.id,
									name: e.target.value,
									colorHex: variant.colorHex ?? undefined,
									stock: variant.stock,
								})
							}
							className="max-w-48"
						/>
						<Input
							type="number"
							min={0}
							defaultValue={variant.stock}
							onBlur={(e) =>
								Number(e.target.value) !== variant.stock &&
								updateVariant.mutate({
									id: variant.id,
									name: variant.name,
									colorHex: variant.colorHex ?? undefined,
									stock: Number(e.target.value) || 0,
								})
							}
							className="w-20"
						/>
						<span className="text-muted-foreground text-xs">na stanju</span>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="ml-auto"
							onClick={() => removeVariant.mutate({ id: variant.id })}
						>
							Obriši
						</Button>
					</div>
				))}
				{variants.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Još uvek nema dodatih nijansi.
					</p>
				)}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!name.trim()) return;
					addVariant.mutate({ productId, name: name.trim(), colorHex, stock });
				}}
				className="flex flex-wrap items-end gap-2"
			>
				<div className="space-y-1">
					<label
						htmlFor="variant-color"
						className="text-muted-foreground text-xs"
					>
						Boja
					</label>
					<input
						id="variant-color"
						type="color"
						value={colorHex}
						onChange={(e) => setColorHex(e.target.value)}
						className="h-8 w-12 cursor-pointer rounded border border-input"
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor="variant-name"
						className="text-muted-foreground text-xs"
					>
						Naziv nijanse
					</label>
					<Input
						id="variant-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="npr. Ruby Red"
						className="w-40"
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor="variant-stock"
						className="text-muted-foreground text-xs"
					>
						Na stanju
					</label>
					<Input
						id="variant-stock"
						type="number"
						min={0}
						value={stock}
						onChange={(e) => setStock(Number(e.target.value) || 0)}
						className="w-20"
					/>
				</div>
				<Button type="submit" disabled={addVariant.isPending || !name.trim()}>
					Dodaj nijansu
				</Button>
			</form>
		</div>
	);
}
