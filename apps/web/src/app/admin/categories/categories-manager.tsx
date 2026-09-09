"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

export default function CategoriesManager() {
	const [name, setName] = useState("");
	const { data: categories, isLoading } = useQuery(
		trpc.categories.list.queryOptions(),
	);

	const createCategory = useMutation(
		trpc.categories.create.mutationOptions({
			onSuccess: () => {
				toast.success("Kategorija je dodata");
				setName("");
				queryClient.invalidateQueries({
					queryKey: trpc.categories.list.queryKey(),
				});
			},
		}),
	);

	const deleteCategory = useMutation(
		trpc.categories.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Kategorija je obrisana");
				queryClient.invalidateQueries({
					queryKey: trpc.categories.list.queryKey(),
				});
			},
		}),
	);

	return (
		<div className="space-y-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (name.trim()) {
						createCategory.mutate({ name: name.trim() });
					}
				}}
				className="flex max-w-sm gap-2"
			>
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Naziv kategorije"
				/>
				<Button
					type="submit"
					disabled={createCategory.isPending || !name.trim()}
				>
					Dodaj
				</Button>
			</form>

			{isLoading && (
				<p className="text-muted-foreground text-sm">Učitavanje...</p>
			)}

			{!isLoading && categories?.length === 0 && (
				<p className="text-muted-foreground text-sm">
					Još uvek nema kategorija.
				</p>
			)}

			{!!categories?.length && (
				<div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
					{categories.map((cat) => (
						<div
							key={cat.id}
							className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.18)] transition-shadow hover:shadow-[0_12px_28px_-8px_oklch(0.64_0.11_12_/_0.3)]"
						>
							<Link href={`/admin?categoryId=${cat.id}`} className="block">
								<p className="font-serif text-lg">{cat.name}</p>
								<p className="mt-1 text-muted-foreground text-sm">
									{cat.productCount} proizvoda
								</p>
							</Link>
							<Button
								variant="destructive"
								size="sm"
								className="mt-4 self-start"
								onClick={() => deleteCategory.mutate({ id: cat.id })}
							>
								Obriši
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
