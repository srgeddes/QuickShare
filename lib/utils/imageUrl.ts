export function getImageUrlFromKey(key?: string): string {
	if (!key) return "";
	const base = process.env.QUICKSHARE_IMAGE_CDN_URL!;
	return `${base}/${key}`;
}
