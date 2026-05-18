'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    frameShape: searchParams.get('frameShape') || '',
    frameMaterial: searchParams.get('frameMaterial') || '',
    polarized: searchParams.get('polarized') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          params.append(k, v);
        }
      });
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      frameShape: searchParams.get('frameShape') || '',
      frameMaterial: searchParams.get('frameMaterial') || '',
      polarized: searchParams.get('polarized') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page')) || 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters.page, filters.sort, filters.category, filters.gender, filters.frameShape, filters.frameMaterial, filters.polarized, filters.search]);

  const applyPriceFilters = () => {
    setFilters((f) => ({ ...f, page: 1 }));
    fetchProducts();
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      frameShape: '',
      frameMaterial: '',
      polarized: '',
      sort: 'newest',
      search: '',
      minPrice: '',
      maxPrice: '',
      page: 1
    });
    router.push('/products');
  };

  const shapes = ['aviator', 'wayfarer', 'round', 'square', 'cat-eye', 'rectangle', 'sport', 'oversized', 'clubmaster'];
  const genders = ['men', 'women', 'unisex'];
  const materials = ['Acetate', 'Titanium', 'Metal', 'Polycarbonate', 'Mixed'];
  const polarizedOptions = [
    { value: 'true', label: 'Polarized Tech Only' },
    { value: 'false', label: 'Standard Lenses' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Customer Rated' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-10 pb-6 border-b border-neutral-100 dark:border-neutral-900">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Exclusive Eyewear</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>
            {filters.search ? `Search: "${filters.search}"` : filters.category ? `${filters.category} Collection` : 'All Premium Sunglasses'}
          </h1>
          {pagination.total !== undefined && <p className="text-neutral-400 text-xs mt-1 font-semibold uppercase tracking-wider">{pagination.total} Custom Models Available</p>}
        </div>
        <div className="flex items-center gap-3">
          <select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="input-field text-xs uppercase font-bold tracking-wider py-2.5 px-4 w-52 bg-transparent border-neutral-200 dark:border-neutral-800">
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider bg-black text-white dark:bg-white dark:text-black px-6 py-3 hover:opacity-90 transition-all">
            <HiOutlineAdjustments size={16} /> Filters Stack
          </button>
        </div>
      </div>

      {/* Products list grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] shimmer" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-neutral-400 text-base font-light">No premium sunglasses matched your specifications.</p>
          <button onClick={clearFilters} className="bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-bold tracking-widest py-3.5 px-8 mt-6">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
              className={`w-10 h-10 font-bold text-xs transition-all ${p === pagination.page ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-200'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Sidebar Filters */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setFiltersOpen(false)} />
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-950 z-50 p-6 overflow-y-auto border-l border-neutral-100 dark:border-neutral-900 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-extrabold uppercase text-sm tracking-wider" style={{ fontFamily: 'Outfit' }}>Filters Stack</h3>
                  <button onClick={() => setFiltersOpen(false)} className="btn-ghost p-2"><HiOutlineX size={20} /></button>
                </div>

                {/* Polarized option */}
                <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-900">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Lens Technology</h4>
                  <div className="flex flex-col gap-2">
                    {polarizedOptions.map((opt) => (
                      <button key={opt.value} onClick={() => setFilters((f) => ({ ...f, polarized: f.polarized === opt.value ? '' : opt.value }))}
                        className={`text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border ${filters.polarized === opt.value ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-900">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Gender</h4>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <button key={g} onClick={() => setFilters((f) => ({ ...f, gender: f.gender === g ? '' : g }))}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${filters.gender === g ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Shape */}
                <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-900">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Frame Shape</h4>
                  <div className="flex flex-wrap gap-2">
                    {shapes.map((s) => (
                      <button key={s} onClick={() => setFilters((f) => ({ ...f, frameShape: f.frameShape === s ? '' : s }))}
                        className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all border ${filters.frameShape === s ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Material */}
                <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-900">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Frame Material</h4>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((m) => (
                      <button key={m} onClick={() => setFilters((f) => ({ ...f, frameMaterial: f.frameMaterial === m ? '' : m }))}
                        className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all border ${filters.frameMaterial === m ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range input limits */}
                <div className="mb-8">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Price Limit (₹)</h4>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="input-field text-xs py-2 bg-transparent" />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="input-field text-xs py-2 bg-transparent" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={clearFilters} className="btn-secondary flex-1 py-3 text-xs uppercase font-bold tracking-wider">Reset</button>
                <button onClick={applyPriceFilters} className="bg-black text-white dark:bg-white dark:text-black flex-1 py-3 text-xs uppercase font-bold tracking-wider">Apply Stack</button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs uppercase font-bold tracking-wider animate-pulse">Loading Premium Collection...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
