import path from "path";
import { unlink } from "fs/promises";
import { Recipie } from "@/models";

export const uploadDir = path.join(process.cwd(), 'uploads');

export const imagePath = (name: string) => path.join(uploadDir, name);

const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
}

// Unknown extensions keep the old behavior of serving as JPEG
export const contentTypeFor = (name: string) =>
    mimeTypes[path.extname(name).toLowerCase()] ?? 'image/jpeg';

// Delete an uploaded image once no recipe points at it anymore.
// Call after the DB write so the changed/removed recipe is no longer counted.
export async function removeImageIfUnused(name: string) {
    if (!name) return;
    if (await Recipie.exists({ image: name })) return;
    try {
        await unlink(imagePath(name));
    } catch (err) {
        // Already gone is fine; anything else shouldn't fail the request
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`Could not remove image ${name}:`, err);
        }
    }
}
