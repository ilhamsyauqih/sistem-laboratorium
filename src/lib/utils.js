import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export async function compressImage(file, { quality = 0.7, maxWidth = 1200, type = 'image/jpeg' } = {}) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            image.src = e.target.result;
        };

        reader.onerror = (e) => reject(e);

        image.onerror = (e) => reject(new Error('Failed to load image'));

        image.onload = () => {
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob failed'));
                        return;
                    }
                    // create a new File from the blob to keep the name/attributes
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                        type: type,
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                },
                type,
                quality
            );
        };

        reader.readAsDataURL(file);
    });
}
