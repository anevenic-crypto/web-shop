const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

export function slugify(input: string) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(DIACRITICS_REGEX, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
	name: string,
	exists: (slug: string) => Promise<boolean>,
) {
	const base = slugify(name) || "item";
	let slug = base;
	let suffix = 2;
	while (await exists(slug)) {
		slug = `${base}-${suffix}`;
		suffix += 1;
	}
	return slug;
}
