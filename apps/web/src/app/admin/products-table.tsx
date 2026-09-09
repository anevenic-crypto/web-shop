"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@web-shop/ui/components/alert-dialog";
import { Badge } from "@web-shop/ui/components/badge";
import { Button } from "@web-shop/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web-shop/ui/components/select";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export default function ProductsTable() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categoryId = searchParams.get("categoryId") ?? undefined;

	const { data: categories } = useQuery(trpc.categories.list.queryOptions());
	const { data: products, isLoading } = useQuery(
		trpc.products.list.queryOptions({ categoryId }),
	);

	const activeCategory = categories?.find((cat) => cat.id === categoryId);

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-semibold text-xl">
					Proizvodi{activeCategory ? ` — ${activeCategory.name}` : ""}
				</h1>
				<Link href="/admin/products/new">
					<Button>Dodaj proizvod</Button>
				</Link>
			</div>

			<div className="mb-6 flex items-center gap-2">
				<Select
					value={categoryId ?? "all"}
					onValueChange={(value) => {
						if (!value || value === "all") {
							router.push("/admin");
						} else {
							router.push(`/admin?categoryId=${value}`);
						}
					}}
				>
					<SelectTrigger className="w-64">
						<SelectValue placeholder="Sve kategorije" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Sve kategorije</SelectItem>
						{categories?.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								{cat.name} ({cat.productCount})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{activeCategory && (
					<Link href="/admin">
						<Button variant="ghost" size="sm">
							Prikaži sve
						</Button>
					</Link>
				)}
			</div>

			{isLoading && (
				<p className="text-muted-foreground text-sm">Učitavanje...</p>
			)}

			{!isLoading && products?.length === 0 && (
				<p className="text-muted-foreground text-sm">
					{activeCategory
						? "Nema proizvoda u ovoj kategoriji."
						: "Još uvek nema proizvoda."}
				</p>
			)}

			{!!products?.length && (
				<div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
					{products.map((product) => {
						const cover = product.images[0];
						return (
							<div
								key={product.id}
								className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.18)] transition-shadow hover:shadow-[0_12px_28px_-8px_oklch(0.64_0.11_12_/_0.3)]"
							>
								<Link
									href={`/proizvod/${product.slug}`}
									target="_blank"
									className="aspect-square w-full overflow-hidden bg-muted"
								>
									{cover ? (
										<img
											src={cover.url}
											alt={product.name}
											className="size-full object-cover transition-transform hover:scale-105"
										/>
									) : (
										<div className="flex size-full items-center justify-center text-muted-foreground text-xs">
											Bez slike
										</div>
									)}
								</Link>
								<div className="flex flex-1 flex-col gap-1.5 p-4">
									<div className="flex items-start justify-between gap-2">
										<p className="line-clamp-2 font-medium text-sm">
											{product.name}
										</p>
										<Badge
											variant={product.isPublished ? "default" : "outline"}
											className="shrink-0"
										>
											{product.isPublished ? "Objavljen" : "Skriven"}
										</Badge>
									</div>
									<p className="text-muted-foreground text-xs">
										{product.brand ?? "-"}
									</p>
									<p className="font-semibold">{formatRsd(product.priceRsd)}</p>
									<p className="text-muted-foreground text-xs">
										{product.category?.name ?? "Bez kategorije"} · Stanje:{" "}
										{product.stock}
									</p>
									<div className="mt-auto flex flex-wrap gap-2 pt-3">
										<Link href={`/proizvod/${product.slug}`} target="_blank">
											<Button variant="outline" size="sm">
												Pogledaj
											</Button>
										</Link>
										<Link href={`/admin/products/${product.id}/edit`}>
											<Button variant="outline" size="sm">
												Izmeni
											</Button>
										</Link>
										<DeleteProductButton id={product.id} name={product.name} />
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function DeleteProductButton({ id, name }: { id: string; name: string }) {
	const deleteProduct = useMutation(
		trpc.products.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Proizvod obrisan");
				queryClient.invalidateQueries({
					queryKey: trpc.products.list.queryKey(),
				});
			},
		}),
	);

	return (
		<AlertDialog>
			<AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
				Obriši
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Obriši proizvod "{name}"?</AlertDialogTitle>
					<AlertDialogDescription>
						Ova radnja je trajna i briše i sve slike proizvoda.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel render={<Button variant="outline" />}>
						Otkaži
					</AlertDialogCancel>
					<AlertDialogAction
						render={<Button variant="destructive" />}
						onClick={() => deleteProduct.mutate({ id })}
					>
						Obriši
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
