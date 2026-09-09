import { auth } from "@web-shop/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "admin") {
		return (
			<div className="mx-auto mt-10 max-w-md p-6 text-center">
				<h1 className="font-semibold text-xl">Nemate pristup</h1>
				<p className="mt-2 text-muted-foreground text-sm">
					Ova stranica je dostupna samo administratorima.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl p-4">
			<nav className="mb-6 flex gap-4 text-sm">
				<Link href="/admin">Proizvodi</Link>
				<Link href="/admin/categories">Kategorije</Link>
				<Link href="/admin/promos">Reklame i tekstovi</Link>
			</nav>
			{children}
		</div>
	);
}
