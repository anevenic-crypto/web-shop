"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

// next-themes renders an inline <script> to prevent a theme flash on load.
// React 19 warns about script tags rendered by components, but the script
// still runs correctly during SSR — this warning is a known false positive.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const originalConsoleError = console.error;
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Encountered a script tag")
		) {
			return;
		}
		originalConsoleError.apply(console, args);
	};
}

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
