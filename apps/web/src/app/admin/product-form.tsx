"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { Label } from "@web-shop/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web-shop/ui/components/select";
import { Switch } from "@web-shop/ui/components/switch";
import { Textarea } from "@web-shop/ui/components/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { queryClient, trpc } from "@/utils/trpc";

const productSchema = z.object({
	name: z.string().min(1, "Naziv je obavezan"),
	description: z.string(),
	brand: z.string(),
	priceRsd: z.number().int().nonnegative("Cena mora biti pozitivna"),
	stock: z.number().int().nonnegative("Stanje mora biti pozitivno"),
	categoryId: z.string(),
	isPublished: z.boolean(),
});

type ExistingProduct = {
	id: string;
	name: string;
	description: string | null;
	brand: string | null;
	priceRsd: number;
	stock: number;
	categoryId: string | null;
	isPublished: boolean;
};

export default function ProductForm({
	product,
}: {
	product?: ExistingProduct;
}) {
	const router = useRouter();
	const { data: categories } = useQuery(trpc.categories.list.queryOptions());

	const createProduct = useMutation(
		trpc.products.create.mutationOptions({
			onSuccess: (created) => {
				toast.success("Proizvod je kreiran");
				queryClient.invalidateQueries({
					queryKey: trpc.products.list.queryKey(),
				});
				router.push(`/admin/products/${created.id}/edit`);
			},
		}),
	);

	const updateProduct = useMutation(
		trpc.products.update.mutationOptions({
			onSuccess: () => {
				toast.success("Proizvod je sačuvan");
				queryClient.invalidateQueries({
					queryKey: trpc.products.list.queryKey(),
				});
				if (product) {
					queryClient.invalidateQueries({
						queryKey: trpc.products.getById.queryKey({ id: product.id }),
					});
				}
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			name: product?.name ?? "",
			description: product?.description ?? "",
			brand: product?.brand ?? "",
			priceRsd: product?.priceRsd ?? 0,
			stock: product?.stock ?? 0,
			categoryId: product?.categoryId ?? "",
			isPublished: product?.isPublished ?? false,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				name: value.name,
				description: value.description || undefined,
				brand: value.brand || undefined,
				priceRsd: value.priceRsd,
				stock: value.stock,
				categoryId: value.categoryId || null,
				isPublished: value.isPublished,
			};
			if (product) {
				await updateProduct.mutateAsync({ id: product.id, ...payload });
			} else {
				await createProduct.mutateAsync(payload);
			}
		},
		validators: {
			onSubmit: productSchema,
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="max-w-lg space-y-4"
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Naziv</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-red-500 text-xs">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="brand">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Brend</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Opis</Label>
						<Textarea
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="categoryId">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Kategorija</Label>
						<Select
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value ?? "")}
						>
							<SelectTrigger id={field.name} className="w-full">
								<SelectValue placeholder="Bez kategorije" />
							</SelectTrigger>
							<SelectContent>
								{categories?.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			<div className="flex gap-4">
				<form.Field name="priceRsd">
					{(field) => (
						<div className="flex-1 space-y-2">
							<Label htmlFor={field.name}>Cena (RSD)</Label>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								min={0}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-xs">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="stock">
					{(field) => (
						<div className="flex-1 space-y-2">
							<Label htmlFor={field.name}>Stanje</Label>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								min={0}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-xs">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			</div>

			<form.Field name="isPublished">
				{(field) => (
					<div className="flex items-center gap-2">
						<Switch
							id={field.name}
							checked={field.state.value}
							onCheckedChange={(checked) => field.handleChange(checked)}
						/>
						<Label htmlFor={field.name}>Objavljen (vidljiv kupcima)</Label>
					</div>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<Button type="submit" disabled={!canSubmit || isSubmitting}>
						{isSubmitting
							? "Čuvanje..."
							: product
								? "Sačuvaj izmene"
								: "Kreiraj proizvod"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
