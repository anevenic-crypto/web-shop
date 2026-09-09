import { Suspense } from "react";

import ProductsTable from "./products-table";

export default function AdminProductsPage() {
	return (
		<Suspense>
			<ProductsTable />
		</Suspense>
	);
}
