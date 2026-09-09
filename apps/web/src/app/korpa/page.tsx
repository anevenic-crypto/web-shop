"use client";

import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import Link from "next/link";
import { useEffect, useState } from "react";

import AmbientBackground from "@/components/ambient-background";
import {
	type CartItem,
	getCart,
	removeFromCart,
	subscribeToCart,
	updateCartQuantity,
} from "@/lib/cart";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export default function KorpaPage() {
	const [items, setItems] = useState<CartItem[] | null>(null);

	useEffect(() => {
		const refresh = () => setItems(getCart());
		refresh();
		return subscribeToCart(refresh);
	}, []);

	if (items === null) {
		return null;
	}

	const total = items.reduce(
		(sum, item) => sum + item.quantity * item.priceRsd,
		0,
	);

	return (
		<div className="relative overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto max-w-3xl px-6 py-16">
				<h1 className="font-serif text-4xl">Korpa</h1>

				{items.length === 0 ? (
					<div className="mt-10 text-center">
						<p className="text-muted-foreground">Vaša korpa je prazna.</p>
						<Link href="/prodavnica">
							<Button className="mt-4 rounded-full px-6">
								Pogledaj proizvode
							</Button>
						</Link>
					</div>
				) : (
					<div className="mt-10 space-y-4">
						{items.map((item) => (
							<div
								key={`${item.productId}:${item.variantId ?? ""}`}
								className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4"
							>
								<div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
									{item.image ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={item.image}
											alt={item.name}
											className="size-full object-cover"
										/>
									) : null}
								</div>
								<div className="min-w-0 flex-1">
									<p className="line-clamp-1 font-serif">{item.name}</p>
									{item.variantName && (
										<p className="text-muted-foreground text-xs">
											Nijansa: {item.variantName}
										</p>
									)}
									<p className="text-muted-foreground text-sm">
										{formatRsd(item.priceRsd)}
									</p>
								</div>
								<Input
									type="number"
									min={1}
									value={item.quantity}
									onChange={(e) =>
										updateCartQuantity(
											item.productId,
											Number(e.target.value) || 1,
											item.variantId,
										)
									}
									className="w-16 text-center"
								/>
								<p className="w-24 shrink-0 text-right font-medium">
									{formatRsd(item.quantity * item.priceRsd)}
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => removeFromCart(item.productId, item.variantId)}
								>
									Ukloni
								</Button>
							</div>
						))}

						<div className="flex items-center justify-between border-t pt-6">
							<p className="font-serif text-xl">Ukupno</p>
							<p className="font-semibold text-primary text-xl">
								{formatRsd(total)}
							</p>
						</div>

						<p className="text-muted-foreground text-sm">
							Poručivanje i plaćanje uskoro stižu — za sada korpa služi da
							sačuvate šta vam se dopalo.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
