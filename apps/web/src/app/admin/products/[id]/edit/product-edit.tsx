"use client";

import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

import ProductForm from "../../../product-form";
import ProductImages from "./product-images";
import ProductVariants from "./product-variants";

export default function ProductEdit({ id }: { id: string }) {
	const { data: product, isLoading } = useQuery(
		trpc.products.getById.queryOptions({ id }),
	);

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Učitavanje...</p>;
	}

	if (!product) {
		return (
			<p className="text-muted-foreground text-sm">Proizvod nije pronađen.</p>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-4 font-semibold text-xl">Izmeni proizvod</h1>
				<ProductForm product={product} />
			</div>
			<ProductImages productId={product.id} images={product.images} />
			<ProductVariants productId={product.id} variants={product.variants} />
		</div>
	);
}
