'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { X, Upload, Loader2 } from 'lucide-react';

export default function ImageUploader({ bucket, value, onChange, multiple = true, maxFiles = 10 }: {
  bucket: string; value: string[]; onChange: (urls: string[]) => void; multiple?: boolean; maxFiles?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

  async function uploadFiles(files: FileList) {
    if (!multiple && files.length > 1) { toast.error('Only one image allowed'); return; }
    if (files.length > maxFiles - value.length) { toast.error('Max ' + maxFiles + ' images'); return; }
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const path = Date.now() + '-' + file.name.replace(/\s+/g, '-');
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      onChange([...value, ...newUrls]);
      toast.success(newUrls.length + ' image(s) uploaded');
    } catch (e: any) { toast.error(e.message || 'Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-rose-100">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      {value.length < maxFiles && (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-rose-200 rounded-lg p-6 cursor-pointer hover:border-rose-400">
          {uploading ? <Loader2 className="animate-spin text-rose-500" /> : <Upload className="text-rose-500" />}
          <span className="text-sm text-rose-700">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
          <input type="file" accept="image/*" multiple={multiple} disabled={uploading}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)} className="hidden" />
        </label>
      )}
    </div>
  );
}
