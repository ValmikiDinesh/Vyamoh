'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MediaUploader({ images = [], videos = [], onImagesChange, onVideosChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDropImages = useCallback(async (files) => {
    if (files.length === 0) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    try {
      const { data } = await api.post('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onImagesChange([...images, ...data.images]);
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch (err) {
      console.error('Image upload error:', err.response?.data || err.message || err);
      toast.error('Upload failed');
    }
    finally { setUploading(false); setProgress(0); }
  }, [images, onImagesChange]);

  const onDropVideos = useCallback(async (files) => {
    if (files.length === 0) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    files.forEach((f) => formData.append('videos', f));
    try {
      const { data } = await api.post('/products/upload-videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onVideosChange([...videos, ...data.videos.map((v) => v.url)]);
      toast.success('Video uploaded');
    } catch (err) {
      console.error('Video upload error:', err.response?.data || err.message || err);
      toast.error('Video upload failed');
    }
    finally { setUploading(false); setProgress(0); }
  }, [videos, onVideosChange]);

  const imgDropzone = useDropzone({ onDrop: onDropImages, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxFiles: 10 });
  const vidDropzone = useDropzone({ onDrop: onDropVideos, accept: { 'video/*': ['.mp4', '.mov', '.webm'] }, maxFiles: 5 });

  const removeImage = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  const removeVideo = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    onVideosChange(videos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          <HiOutlinePhotograph className="inline mr-1" /> Product Images
        </label>
        <div {...imgDropzone.getRootProps()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
          style={{ borderColor: imgDropzone.isDragActive ? 'var(--brand-500)' : 'var(--border-color)', background: imgDropzone.isDragActive ? 'rgba(232,93,58,0.05)' : 'var(--bg-tertiary)' }}>
          <input {...imgDropzone.getInputProps()} />
          <HiOutlineCloudUpload size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Drag & drop images or click to browse</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP (max 10MB each)</p>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group" style={{ border: '1px solid var(--border-color)' }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={(e) => removeImage(e, i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                  <HiOutlineX size={14} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--brand-500)', color: '#fff' }}>Main</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          <HiOutlineVideoCamera className="inline mr-1" /> Product Videos
        </label>
        <div {...vidDropzone.getRootProps()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
          style={{ borderColor: vidDropzone.isDragActive ? 'var(--brand-500)' : 'var(--border-color)', background: vidDropzone.isDragActive ? 'rgba(232,93,58,0.05)' : 'var(--bg-tertiary)' }}>
          <input {...vidDropzone.getInputProps()} />
          <HiOutlineVideoCamera size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Drag & drop videos or click to browse</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>MP4, MOV, WebM (max 100MB)</p>
        </div>
        {videos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {videos.map((vid, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden group" style={{ border: '1px solid var(--border-color)' }}>
                <video src={vid} className="w-full aspect-video object-cover" muted />
                <button type="button" onClick={(e) => removeVideo(e, i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                  <HiOutlineX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Uploading...</span>
            <span style={{ color: 'var(--brand-500)' }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--brand-500)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
