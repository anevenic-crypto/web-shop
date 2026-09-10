"use client";

import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { useState } from "react";
import { toast } from "sonner";

import { addToCart } from "@/lib/cart";

type Variant = {
	id: string;
	name: string;
	colorHex: string | null;
	stock: number;
};

type ProductViewData = {
	id: string;
	name: string;
	brand: string | null;
	description: string | null;
	priceRsd: number;
	stock: number;
	category: { name: string } | null;
	images: { url: string }[];
	variants: Variant[];
};

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export default function ProductView({ product }: { product: ProductViewData }) {
	const hasVariants = product.variants.length > 0;
	const [selectedVariantId, setSelectedVariantId] = useState(
		hasVariants
			? (product.variants.find((v) => v.stock > 0)?.id ??
					product.variants[0].id)
			: "",
	);
	const [quantity, setQuantity] = useState(1);
	const cover = product.images[0];

	const selectedVariant = hasVariants
		? product.variants.find((v) => v.id === selectedVariantId)
		: undefined;

	const availableStock = hasVariants
		? (selectedVariant?.stock ?? 0)
		: product.stock;
	const outOfStock = availableStock <= 0;

	function handleAddToCart() {
		addToCart(
			{
				productId: product.id,
				variantId: selectedVariant?.id,
				variantName: selectedVariant?.name,
				name: product.name,
				priceRsd: product.priceRsd,
				image: cover?.url,
			},
			quantity,
		);
		const variantSuffix = selectedVariant ? ` — ${selectedVariant.name}` : "";
		toast.success(
			`Dodato u korpu: ${product.name}${variantSuffix} (${quantity}×)`,
		);
	}

	return (
		<div className="mx-auto grid w-full max-w-4xl gap-10 p-6 md:grid-cols-2 md:p-10">
			<div className="aspect-square w-full overflow-hidden rounded-3xl bg-muted">
				{cover ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={cover.url}
						alt={product.name}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground text-sm">
						Nema slike
					</div>
				)}
			</div>

			<div className="flex flex-col gap-3">
				{product.category && (
					<p className="text-muted-foreground text-sm uppercase tracking-wide">
						{product.category.name}
					</p>
				)}
				<h1 className="font-serif text-3xl">{product.name}</h1>
				{product.brand && (
					<p className="text-muted-foreground">{product.brand}</p>
				)}
				<p className="mt-2 font-bold text-2xl text-primary">
					{formatRsd(product.priceRsd)}
				</p>

				{product.description && (
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
						{product.description}
					</p>
				)}

				{hasVariants && (
					<div className="mt-4">
						<p className="mb-2 font-medium text-sm">
							Nijansa{selectedVariant ? `: ${selectedVariant.name}` : ""}
						</p>
						<div className="flex flex-wrap gap-2">
							{product.variants.map((variant) => (
								<button
									key={variant.id}
									type="button"
									onClick={() => {
										setSelectedVariantId(variant.id);
										setQuantity(1);
									}}
									disabled={variant.stock <= 0}
									title={variant.name}
									className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
										variant.id === selectedVariantId
											? "border-primary bg-accent text-accent-foreground ring-2 ring-primary/40"
											: "border-border hover:bg-accent"
									}`}
								>
									<span
										className="size-4 rounded-full border"
										style={{
											backgroundColor: variant.colorHex ?? "transparent",
										}}
									/>
									{variant.name}
								</button>
							))}
						</div>
					</div>
				)}

				<p className="mt-4 text-sm">
					{outOfStock ? (
						<span className="text-destructive">Nema na stanju</span>
					) : availableStock <= 3 ? (
						<span className="font-medium text-[oklch(0.6_0.15_40)]">
							Samo još {availableStock} na stanju!
						</span>
					) : (
						<span>Na stanju: {availableStock}</span>
					)}
				</p>

				<div className="mt-2 flex items-center gap-3">
					{!outOfStock && (
						<Input
							type="number"
							min={1}
							max={availableStock}
							value={quantity}
							onChange={(e) =>
								setQuantity(
									Math.min(
										availableStock,
										Math.max(1, Number(e.target.value) || 1),
									),
								)
							}
							className="w-20"
						/>
					)}
					<Button
						onClick={handleAddToCart}
						disabled={outOfStock}
						className="flex-1 sm:flex-none"
					>
						{outOfStock ? "Nema na stanju" : "Dodaj u korpu"}
					</Button>
				</div>
			</div>
		</div>
	);
}
