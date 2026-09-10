"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web-shop/ui/components/select";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
	{ value: "newest", label: "Najnovije" },
	{ value: "price-asc", label: "Cena: niža ka višoj" },
	{ value: "price-desc", label: "Cena: viša ka nižoj" },
] as const;

const DEFAULTS: Record<string, string> = {
	sort: "newest",
	brand: "all",
};

export default function ProductFilters({ brands }: { brands: string[] }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const sort = searchParams.get("sort") ?? DEFAULTS.sort;
	const brand = searchParams.get("brand") ?? DEFAULTS.brand;

	function updateParam(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value === DEFAULTS[key]) {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		const query = params.toString();
		router.push(`${pathname}${query ? `?${query}` : ""}` as Route);
	}

	return (
		<div className="flex flex-wrap gap-3">
			<Select
				value={brand}
				onValueChange={(value) => value && updateParam("brand", value)}
			>
				<SelectTrigger className="w-[170px] rounded-full">
					<SelectValue placeholder="Brend">
						{(value: string) => (value === "all" ? "Svi brendovi" : value)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Svi brendovi</SelectItem>
					{brands.map((b) => (
						<SelectItem key={b} value={b}>
							{b}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={sort}
				onValueChange={(value) => value && updateParam("sort", value)}
			>
				<SelectTrigger className="w-[200px] rounded-full">
					<SelectValue placeholder="Sortiraj po">
						{(value: string) =>
							SORT_OPTIONS.find((opt) => opt.value === value)?.label ??
							"Sortiraj po"
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{SORT_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
