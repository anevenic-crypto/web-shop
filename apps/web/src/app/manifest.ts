import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Vellure",
		short_name: "Vellure",
		description: "Prestižna kozmetika — pažljivo odabrana luksuzna šminka.",
		start_url: "/",
		display: "standalone",
		background_color: "#fdf5f6",
		theme_color: "#c56f7a",
		icons: [
			{
				src: "/favicon/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicon/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
