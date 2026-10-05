import "@web-shop/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	// "standalone" treba samo za Docker; na Vercel-u pravi gresku (nft.json).
	...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
