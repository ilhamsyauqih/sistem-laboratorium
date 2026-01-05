import { compressImage } from './utils';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads an image file to Cloudinary with optional compression.
 * @param {File} file - The file to upload.
 * @param {Object} options - Upload options.
 * @param {string} options.folder - Cloudinary folder to upload to.
 * @param {boolean} options.compress - Whether to compress the image first.
 * @returns {Promise<Object>} - The Cloudinary response data.
 */
export async function uploadToCloudinary(file, { folder = 'sistem-laboratorium', compress = true } = {}) {
    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing (VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET)');
    }

    let fileToUpload = file;
    if (compress) {
        fileToUpload = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
    }

    return await response.json();
}
