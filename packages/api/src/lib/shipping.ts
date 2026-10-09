/** Cena dostave (RSD). Jedno mesto za promenu — koristi ga i korpa i server. */
export const SHIPPING_RSD = 390;
/** Iznad ovog iznosa korpe dostava je besplatna. */
export const FREE_SHIPPING_FROM_RSD = 6000;

export function shippingFor(subtotalRsd: number) {
	return subtotalRsd >= FREE_SHIPPING_FROM_RSD ? 0 : SHIPPING_RSD;
}
