import { env } from "@web-shop/env/server";
import { Resend } from "resend";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

type OrderMail = {
	id: string;
	customerName: string;
	phone: string;
	address: string;
	note: string | null;
	email: string | null;
	shippingRsd: number;
	totalRsd: number;
	items: {
		name: string;
		variantName: string | null;
		priceRsd: number;
		quantity: number;
	}[];
};

// Dok nemas sopstveni domen na Resend-u, "from" mora biti onboarding@resend.dev
// (Resend tada dozvoljava slanje SAMO na mejl kojim si se registrovala).
const FROM = "Vellure <onboarding@resend.dev>";

/** Čista tekstualna verzija mejla — mejlovi bez text dela češće završe u spamu. */
function itemsText(order: OrderMail) {
	const lines = order.items.map(
		(item) =>
			`- ${item.name}${item.variantName ? ` — ${item.variantName}` : ""} × ${item.quantity}: ${formatRsd(item.priceRsd * item.quantity)}`,
	);
	const subtotal = order.totalRsd - order.shippingRsd;
	lines.push(`Proizvodi: ${formatRsd(subtotal)}`);
	lines.push(`Dostava: ${order.shippingRsd ? formatRsd(order.shippingRsd) : "besplatna"}`);
	lines.push(`Ukupno za plaćanje: ${formatRsd(order.totalRsd)}`);
	return lines.join("\n");
}

function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function itemsTable(order: OrderMail) {
	const rows = order.items
		.map(
			(item) =>
				`<tr><td style="padding:4px 8px">${escapeHtml(item.name)}${item.variantName ? ` — ${escapeHtml(item.variantName)}` : ""} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right">${formatRsd(item.priceRsd * item.quantity)}</td></tr>`,
		)
		.join("");
	const subtotal = order.totalRsd - order.shippingRsd;
	return `
		<table style="border-collapse:collapse;width:100%;max-width:480px">${rows}
			<tr><td style="padding:8px 8px 2px;border-top:1px solid #ddd">Proizvodi</td><td style="padding:8px 8px 2px;text-align:right;border-top:1px solid #ddd">${formatRsd(subtotal)}</td></tr>
			<tr><td style="padding:2px 8px">Dostava</td><td style="padding:2px 8px;text-align:right">${order.shippingRsd ? formatRsd(order.shippingRsd) : "besplatna"}</td></tr>
			<tr><td style="padding:6px 8px;font-weight:bold">Ukupno za plaćanje</td><td style="padding:6px 8px;text-align:right;font-weight:bold">${formatRsd(order.totalRsd)}</td></tr>
		</table>`;
}

/** Mejl vlasniku prodavnice o novoj porudžbini. */
export async function notifyNewOrder(order: OrderMail) {
	if (!env.RESEND_API_KEY || !env.ORDER_NOTIFICATION_EMAIL) {
		return;
	}
	const resend = new Resend(env.RESEND_API_KEY);
	try {
		await resend.emails.send({
			from: FROM,
			to: env.ORDER_NOTIFICATION_EMAIL,
			...(order.email ? { replyTo: order.email } : {}),
			subject: `Nova porudžbina — ${order.customerName} (${formatRsd(order.totalRsd)})`,
			text: `Nova porudžbina na Vellure\n\n${order.customerName}\n${order.phone}\n${order.address}${order.email ? `\n${order.email}` : ""}\n${order.note ? `\nNapomena: ${order.note}\n` : ""}\n${itemsText(order)}\n\nBroj porudžbine: ${order.id}`,
			html: `
				<h2>Nova porudžbina na Vellure</h2>
				<p><strong>${escapeHtml(order.customerName)}</strong><br/>
				${escapeHtml(order.phone)}<br/>
				${escapeHtml(order.address)}${order.email ? `<br/>${escapeHtml(order.email)}` : ""}</p>
				${order.note ? `<p><em>Napomena: ${escapeHtml(order.note)}</em></p>` : ""}
				${itemsTable(order)}
				<p style="margin-top:12px;color:#777;font-size:12px">Broj porudžbine: ${order.id}</p>
			`,
		});
	} catch (error) {
		console.error("Failed to send order notification email", error);
	}
}

/** Potvrda kupcu — samo ako je ostavio mejl. */
export async function sendOrderConfirmation(order: OrderMail) {
	if (!env.RESEND_API_KEY || !order.email) {
		return;
	}
	const resend = new Resend(env.RESEND_API_KEY);
	const kratkiBroj = order.id.slice(0, 8).toUpperCase();
	try {
		await resend.emails.send({
			from: FROM,
			to: order.email,
			...(env.ORDER_NOTIFICATION_EMAIL ? { replyTo: env.ORDER_NOTIFICATION_EMAIL } : {}),
			subject: `Vellure — primili smo vašu porudžbinu #${kratkiBroj}`,
			text: `Hvala, ${order.customerName}!\n\nPrimili smo vašu porudžbinu #${kratkiBroj}. Pozvaćemo vas na ${order.phone} da potvrdimo detalje i dogovorimo dostavu na adresu:\n${order.address}\n\n${itemsText(order)}\n\nPlaćanje je pouzećem — plaćate kuriru pri preuzimanju.${order.shippingRsd ? "" : " Dostava je besplatna."}\nAko nešto nije u redu sa porudžbinom, odgovorite na ovaj mejl.`,
			html: `
				<div style="font-family:Georgia,serif;max-width:520px">
				<h2 style="font-weight:normal">Hvala, ${escapeHtml(order.customerName.split(" ")[0] || order.customerName)}!</h2>
				<p>Primili smo vašu porudžbinu <strong>#${kratkiBroj}</strong>. Pozvaćemo vas na
				<strong>${escapeHtml(order.phone)}</strong> da potvrdimo detalje i dogovorimo dostavu na adresu:</p>
				<p style="padding:8px 12px;background:#faf3f3;border-radius:8px">${escapeHtml(order.address)}</p>
				${itemsTable(order)}
				<p style="margin-top:12px">Plaćanje je pouzećem — plaćate kuriru pri preuzimanju.
				${order.shippingRsd ? "" : "Dostava je besplatna."}</p>
				<p style="color:#777;font-size:12px">Ako nešto nije u redu sa porudžbinom, odgovorite na ovaj mejl.</p>
				</div>
			`,
		});
	} catch (error) {
		console.error("Failed to send order confirmation email", error);
	}
}
