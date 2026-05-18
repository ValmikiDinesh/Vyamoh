'use client';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function VariantManager({ variants = [], onChange }) {
  const addVariant = () => {
    onChange([...variants, { sku: '', color: '', colorHex: '#000000', size: '', weight: '', price: '', stock: 0, isActive: true }]);
  };

  const updateVariant = (idx, field, value) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const removeVariant = (idx) => onChange(variants.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Variants</label>
        <button type="button" onClick={addVariant} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--brand-500)', background: 'rgba(232,93,58,0.1)' }}>
          <HiOutlinePlus size={14} /> Add Variant
        </button>
      </div>
      {variants.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No variants. Click "Add Variant" to create size/color options.</p>
      )}
      <div className="space-y-3">
        {variants.map((v, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Variant {i + 1}</span>
              <button type="button" onClick={() => removeVariant(i)} className="p-1 rounded transition-colors" style={{ color: '#ef4444' }}>
                <HiOutlineTrash size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="input-field text-sm" />
              <div className="flex gap-2">
                <input type="color" value={v.colorHex || '#000000'} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'var(--bg-secondary)' }} />
                <input placeholder="Color name" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="input-field text-sm flex-1" />
              </div>
              <input placeholder="Size (S/M/L/XL)" value={v.size || ''} onChange={(e) => updateVariant(i, 'size', e.target.value)} className="input-field text-sm" />
              <input placeholder="Weight (g)" type="number" value={v.weight || ''} onChange={(e) => updateVariant(i, 'weight', e.target.value)} className="input-field text-sm" />
              <input placeholder="Price (₹)" type="number" value={v.price || ''} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="input-field text-sm" />
              <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} className="input-field text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
