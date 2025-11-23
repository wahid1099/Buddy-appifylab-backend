import axios from 'axios';
import FormData from 'form-data';

/**
 * Upload image to ImgBB
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} - ImgBB image URL
 */
export const uploadToImgBB = async (imageBuffer, filename) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('IMGBB_API_KEY is not configured in environment variables');
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Create form data
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', base64Image);
    formData.append('name', filename);

    // Upload to ImgBB
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: formData.getHeaders(),
    });

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url; // Direct image URL
    } else {
      throw new Error('Invalid response from ImgBB');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload image to ImgBB: ${error.message}`);
  }
};

/**
 * Delete image from ImgBB (optional - ImgBB doesn't provide delete API for free tier)
 * @param {string} imageUrl - ImgBB image URL
 */
export const deleteFromImgBB = async (imageUrl) => {
  // Note: ImgBB free tier doesn't support deletion via API
  // Images are stored permanently unless you upgrade to paid plan
  console.log('ImgBB free tier does not support image deletion via API');
  return true;
};
