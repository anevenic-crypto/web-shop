import PromosManager from "./promos-manager";

export default function PromosPage() {
	return (
		<div>
			<h1 className="mb-4 font-semibold text-xl">Reklame i tekstovi</h1>
			<p className="mb-6 max-w-xl text-muted-foreground text-sm">
				Ovde dodaješ promotivne tekstove i slike koji se prikazuju na početnoj
				strani, pored proizvoda.
			</p>
			<PromosManager />
		</div>
	);
}
