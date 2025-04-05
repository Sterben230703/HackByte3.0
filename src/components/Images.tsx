import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getUserImages, saveImage } from '../services/api';
import type { Image } from '../services/api';
import { Upload } from 'lucide-react';

interface ImagesProps {
  userId: string;
}

interface ImageData extends Image {
  filename: string;
}

export function Images({ userId }: ImagesProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadImages = async () => {
    try {
      console.log('Fetching images for user:', userId);
      const userImages = await getUserImages(userId);
      console.log('Fetched images:', userImages);

      // Map the images to include filename from the URL
      const imagesWithFilename = userImages.map((img) => ({
        ...img,
        filename: img.url.split('/').pop() || 'unknown',
      }));
      setImages(imagesWithFilename);
      setError(null);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error loading images:', err);
    }
  };

  useEffect(() => {
    loadImages();
  }, [userId]);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name);

        // Upload image file
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        console.log('Uploaded file URL:', url);

        // Save image metadata
        await saveImage({
          userId,
          url,
          uploadDate: new Date(),
          filename: file.name,
        } as ImageData);
      }

      // Reload images after upload
      await loadImages();
    } catch (err) {
      setError('Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Images</h1>
        <p className="text-gray-600">Upload and manage your images</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop images here, or click to select files'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-600 mb-8">
          Uploading images...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={image.url}
                alt={image.filename}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 truncate">{image.filename}</p>
              <p className="text-xs text-gray-500">
                {new Date(image.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}