export type CartItem = {
	productId: string;
	variantId?: string;
	name: string;
	variantName?: string;
	priceRsd: number;
	image?: string;
	quantity: number;
};

const CART_KEY = "web-shop-cart";
const CART_EVENT = "web-shop-cart-changed";

function itemKey(item: { productId: string; variantId?: string }) {
	return `${item.productId}:${item.variantId ?? ""}`;
}

function readCart(): CartItem[] {
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

function writeCart(cart: CartItem[]) {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
	} catch {
		// localStorage unavailable, ignore
	}
	window.dispatchEvent(new CustomEvent(CART_EVENT));
	return cart;
}

export function getCart(): CartItem[] {
	return readCart();
}

export function getCartCount(): number {
	return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
	return readCart().reduce(
		(sum, item) => sum + item.quantity * item.priceRsd,
		0,
	);
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number) {
	const cart = readCart();
	const existing = cart.find((entry) => itemKey(entry) === itemKey(item));
	if (existing) {
		existing.quantity += quantity;
	} else {
		cart.push({ ...item, quantity });
	}
	return writeCart(cart);
}

export function removeFromCart(productId: string, variantId?: string) {
	return writeCart(
		readCart().filter(
			(entry) => itemKey(entry) !== itemKey({ productId, variantId }),
		),
	);
}

export function updateCartQuantity(
	productId: string,
	quantity: number,
	variantId?: string,
) {
	const cart = readCart();
	const entry = cart.find(
		(item) => itemKey(item) === itemKey({ productId, variantId }),
	);
	if (entry) {
		entry.quantity = Math.max(1, quantity);
	}
	return writeCart(cart);
}

export function clearCart() {
	return writeCart([]);
}

export function subscribeToCart(callback: () => void) {
	window.addEventListener(CART_EVENT, callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener(CART_EVENT, callback);
		window.removeEventListener("storage", callback);
	};
}
