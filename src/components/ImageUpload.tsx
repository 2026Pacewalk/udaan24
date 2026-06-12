import { useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Resize + compress to a small JPEG data URL (kept well under the DB column limit).
function resizeImage(file: File, maxDim = 400, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height >= width && height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = 'Student Image', required = false }: { value?: string; onChange: (v: string) => void; label?: string; required?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { setErr('Please upload a JPG, PNG or WEBP image.'); return; }
    setErr(''); setBusy(true);
    try { onChange(await resizeImage(f)); } catch { setErr('Could not process the image.'); }
    setBusy(false);
  };

  return (
    <div>
      <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</label>
      <div className="flex items-center gap-3">
        {value
          ? <img src={value} alt="preview" className="w-16 h-16 rounded-full object-cover border border-[#E8EDF5]" />
          : <div className="w-16 h-16 rounded-full bg-[#F5F6FA] border border-[#E8EDF5] flex items-center justify-center text-[#A0AEC0] text-[10px]">No image</div>}
        <div className="flex flex-col gap-1.5">
          {/* accept=image/* (no capture) lets mobile choose Camera OR Gallery; desktop opens file/camera */}
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/*" onChange={handle} className="hidden" />
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex items-center gap-1.5 text-[12px] font-medium text-[#1B2A4A] bg-[#FFF9E6] border border-[#F5B800]/40 px-3 py-1.5 rounded-lg disabled:opacity-60">
            <Upload className="w-3.5 h-3.5" />{busy ? 'Processing…' : value ? 'Replace Photo' : 'Upload Photo'}
          </button>
          {value && <button type="button" onClick={() => onChange('')} className="flex items-center gap-1.5 text-[12px] font-medium text-red-500"><Trash2 className="w-3.5 h-3.5" />Remove</button>}
        </div>
      </div>
      <p className="text-[11px] text-[#718096] mt-1">JPG, PNG or WEBP. On mobile you can pick from camera or gallery.</p>
      {err && <p className="text-[12px] text-red-500 mt-1">{err}</p>}
    </div>
  );
}
