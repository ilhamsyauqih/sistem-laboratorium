
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testUpload() {
    console.log('Testing Cloudinary upload...');
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error('ERROR: Cloudinary credentials missing in .env');
        return;
    }

    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'test_upload',
        });
        console.log('Upload successful!');
        console.log('URL:', result.secure_url);

        if (result.secure_url.includes('cloudinary.com')) {
            console.log('VERIFICATION PASSED: Image uploaded to Cloudinary.');
        } else {
            console.error('VERIFICATION FAILED: URL does not look like Cloudinary.');
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

testUpload();
