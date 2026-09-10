"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import { Label } from "@web-shop/ui/components/label";
import { Textarea } from "@web-shop/ui/components/textarea";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import AmbientBackground from "@/components/ambient-background";
import {
	type CartItem,
	clearCart,
	getCart,
	removeFromCart,
	subscribeToCart,
	updateCartQuantity,
} from "@/lib/cart";
import { trpc } from "@/utils/trpc";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export default function KorpaPage() {
	const [items, setItems] = useState<CartItem[] | null>(null);
	const [orderId, setOrderId] = useState<string | null>(null);
	const [form, setForm] = useState({
		customerName: "",
		phone: "",
		address: "",
		note: "",
	});

	useEffect(() => {
		const refresh = () => setItems(getCart());
		refresh();
		return subscribeToCart(refresh);
	}, []);

	const createOrder = useMutation(
		trpc.orders.create.mutationOptions({
			onSuccess: (data) => {
				clearCart();
				setOrderId(data.id);
			},
			onError: () => {
				toast.error("Porudžbina nije uspela, pokušajte ponovo.");
			},
		}),
	);

	if (items === null) {
		return null;
	}

	const total = items.reduce(
		(sum, item) => sum + item.quantity * item.priceRsd,
		0,
	);

	if (orderId) {
		return (
			<div className="relative isolate overflow-hidden">
				<AmbientBackground />
				<div className="mx-auto max-w-lg px-6 py-24 text-center">
					<h1 className="font-serif text-3xl">Hvala na porudžbini!</h1>
					<p className="mt-3 text-muted-foreground">
						Javićemo vam se uskoro na broj koji ste ostavili da potvrdimo
						detalje i dogovorimo dostavu.
					</p>
					<Link href="/prodavnica">
						<Button className="mt-8 rounded-full px-6">Nastavi kupovinu</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="relative isolate overflow-hidden">
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

						<form
							onSubmit={(e) => {
								e.preventDefault();
								createOrder.mutate({
									customerName: form.customerName,
									phone: form.phone,
									address: form.address,
									note: form.note || undefined,
									items: items.map((item) => ({
										productId: item.productId,
										name: item.name,
										variantName: item.variantName,
										priceRsd: item.priceRsd,
										quantity: item.quantity,
									})),
								});
							}}
							className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6"
						>
							<h2 className="font-serif text-xl">Podaci za porudžbinu</h2>
							<p className="text-muted-foreground text-sm">
								Plaćanje pouzećem ili po dogovoru — kontaktiraćemo vas telefonom
								da potvrdimo porudžbinu i dostavu.
							</p>

							<div className="space-y-2">
								<Label htmlFor="customerName">Ime i prezime</Label>
								<Input
									id="customerName"
									required
									value={form.customerName}
									onChange={(e) =>
										setForm({ ...form, customerName: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Telefon</Label>
								<Input
									id="phone"
									required
									value={form.phone}
									onChange={(e) => setForm({ ...form, phone: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="address">Adresa za dostavu</Label>
								<Input
									id="address"
									required
									value={form.address}
									onChange={(e) =>
										setForm({ ...form, address: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="note">Napomena (opciono)</Label>
								<Textarea
									id="note"
									value={form.note}
									onChange={(e) => setForm({ ...form, note: e.target.value })}
								/>
							</div>

							<Button
								type="submit"
								className="w-full rounded-full"
								disabled={createOrder.isPending}
							>
								{createOrder.isPending ? "Slanje..." : "Pošalji porudžbinu"}
							</Button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
