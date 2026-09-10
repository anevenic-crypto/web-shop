import { env } from "@web-shop/env/server";
import { Resend } from "resend";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export async function notifyNewOrder(order: {
	id: string;
	customerName: string;
	phone: string;
	address: string;
	note: string | null;
	totalRsd: number;
	items: {
		name: string;
		variantName: string | null;
		priceRsd: number;
		quantity: number;
	}[];
}) {
	if (!env.RESEND_API_KEY || !env.ORDER_NOTIFICATION_EMAIL) {
		return;
	}

	const resend = new Resend(env.RESEND_API_KEY);

	const itemsHtml = order.items
		.map(
			(item) =>
				`<tr><td style="padding:4px 8px">${item.name}${item.variantName ? ` — ${item.variantName}` : ""} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right">${formatRsd(item.priceRsd * item.quantity)}</td></tr>`,
		)
		.join("");

	try {
		await resend.emails.send({
			from: "Vellure <onboarding@resend.dev>",
			to: env.ORDER_NOTIFICATION_EMAIL,
			subject: `Nova porudžbina — ${order.customerName} (${formatRsd(order.totalRsd)})`,
			html: `
				<h2>Nova porudžbina na Vellure</h2>
				<p><strong>${order.customerName}</strong><br/>
				${order.phone}<br/>
				${order.address}</p>
				${order.note ? `<p><em>Napomena: ${order.note}</em></p>` : ""}
				<table style="border-collapse:collapse;width:100%;max-width:480px">${itemsHtml}</table>
				<p style="margin-top:12px"><strong>Ukupno: ${formatRsd(order.totalRsd)}</strong></p>
			`,
		});
	} catch (error) {
		console.error("Failed to send order notification email", error);
	}
}
