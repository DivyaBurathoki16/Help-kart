import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import API_URL from '../config/api';

const ImageUpload = ({ images = [], onChange, maxImages = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState(images);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Update preview images when prop changes
  useEffect(() => {
    setPreviewImages(images);
  }, [images]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > maxImages) {
      alert(`You can upload maximum ${maxImages} images`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(getApiUrl('api/upload/service-images'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImages = [...previewImages, ...response.data.images];
      setPreviewImages(newImages);
      onChange(newImages);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    
    // Adjust primary index if needed
    if (primaryIndex >= newImages.length && newImages.length > 0) {
      setPrimaryIndex(newImages.length - 1);
    } else if (index < primaryIndex) {
      setPrimaryIndex(primaryIndex - 1);
    } else if (newImages.length === 0) {
      setPrimaryIndex(0);
    }
    
    onChange(newImages);
  };

  const handleSetPrimary = (index) => {
    setPrimaryIndex(index);
    // Move primary image to first position
    const newImages = [...previewImages];
    const [primaryImg] = newImages.splice(index, 1);
    newImages.unshift(primaryImg);
    setPreviewImages(newImages);
    setPrimaryIndex(0);
    onChange(newImages);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const fakeEvent = { target: { files } };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Service Images {previewImages.length > 0 && `(${previewImages.length}/${maxImages})`}
      </label>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || previewImages.length >= maxImages}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB (max {maxImages} images)
            </p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewImages.map((image, index) => {
            const imageUrl = image.startsWith('http') || image.startsWith('/')
              ? image.startsWith('/') ? `${API_URL}${image}` : image
              : image;
            
            return (
              <div
                key={index}
                className="relative group border-2 rounded-lg overflow-hidden"
                style={{
                  borderColor: index === primaryIndex ? '#3b82f6' : '#e5e7eb',
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Primary Badge */}
                {index === primaryIndex && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(index);
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      index === primaryIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    } opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    {index === primaryIndex ? 'Primary' : 'Set Primary'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewImages.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 First image is set as primary (shown on service cards). Click "Set Primary" to change.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
