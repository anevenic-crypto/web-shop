import { auth } from "@web-shop/auth";
import { putObject } from "@web-shop/storage";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFilename(name: string) {
	return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (session?.user?.role !== "admin") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const formData = await req.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "Missing file" }, { status: 400 });
	}
	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json(
			{ error: "Unsupported file type" },
			{ status: 400 },
		);
	}
	if (file.size > MAX_SIZE_BYTES) {
		return NextResponse.json({ error: "File too large" }, { status: 400 });
	}

	const folderInput = formData.get("folder");
	const folder =
		typeof folderInput === "string" && /^[a-z-]+$/.test(folderInput)
			? folderInput
			: "products";

	const buffer = Buffer.from(await file.arrayBuffer());
	const key = `${folder}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
	const url = await putObject(key, buffer, file.type);

	return NextResponse.json({ key, url });
}
