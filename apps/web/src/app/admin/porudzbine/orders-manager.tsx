"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@web-shop/ui/components/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web-shop/ui/components/select";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

const STATUSES = ["novo", "kontaktirano", "poslato", "otkazano"] as const;

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

function formatDate(date: string | Date) {
	return new Date(date).toLocaleString("sr-RS");
}

export default function OrdersManager() {
	const { data: orders, isLoading } = useQuery(trpc.orders.list.queryOptions());

	const updateStatus = useMutation(
		trpc.orders.updateStatus.mutationOptions({
			onSuccess: () => {
				toast.success("Status ažuriran");
				queryClient.invalidateQueries({
					queryKey: trpc.orders.list.queryKey(),
				});
			},
		}),
	);

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Učitavanje...</p>;
	}

	if (!orders?.length) {
		return (
			<p className="text-muted-foreground text-sm">Još uvek nema porudžbina.</p>
		);
	}

	return (
		<div className="space-y-4">
			{orders.map((o) => (
				<div
					key={o.id}
					className="rounded-3xl border border-border bg-card p-6"
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="font-medium">{o.customerName}</p>
							<p className="text-muted-foreground text-sm">{o.phone}</p>
							<p className="text-muted-foreground text-sm">{o.address}</p>
							{o.note && (
								<p className="mt-1 text-muted-foreground text-xs">"{o.note}"</p>
							)}
							<p className="mt-1 text-muted-foreground text-xs">
								{formatDate(o.createdAt)}
							</p>
						</div>
						<div className="flex flex-col items-end gap-2">
							<Badge>{formatRsd(o.totalRsd)}</Badge>
							<Select
								value={o.status}
								onValueChange={(value) =>
									value && updateStatus.mutate({ id: o.id, status: value })
								}
							>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUSES.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="mt-4 space-y-1 border-t pt-4 text-sm">
						{o.items.map((item) => (
							<div key={item.id} className="flex justify-between">
								<span>
									{item.name}
									{item.variantName ? ` — ${item.variantName}` : ""} ×{" "}
									{item.quantity}
								</span>
								<span className="text-muted-foreground">
									{formatRsd(item.priceRsd * item.quantity)}
								</span>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
