import React, { useRef } from 'react';
import axios from 'axios';

export default function HeaderImage({ value, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append('image', file); 

    try {
      const res = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (res.data.url) {
        onChange(res.data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
    }
  };

  return (
    <div className="mb-6">
      {value !== "" ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Header"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs shadow"
            onClick={() => onChange('')}
          >
            Remove
          </button>
          <p>{value}</p>
        </div>
      ) : (
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
          onClick={() => fileInputRef.current.click()}
        >
          Upload Header Image
        </button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
