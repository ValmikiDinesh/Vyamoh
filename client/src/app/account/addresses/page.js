'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLocationMarker, HiPlus, HiPencil, HiTrash, HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AddressesPage() {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [label, setLabel] = useState('home');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setAddresses(user.addresses || []);
    }
  }, [user, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) return null;

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setCity('');
    setState('');
    setPincode('');
    setLabel('home');
    setIsDefault(addresses.length === 0);
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setAddressLine1(addr.addressLine1 || '');
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
    setLabel(addr.label || 'home');
    setIsDefault(addr.isDefault || false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = { fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, label, isDefault };
    setSubmitting(true);
    try {
      if (editingAddress) {
        const { data } = await api.put(`/auth/addresses/${editingAddress._id}`, payload);
        if (data.success) {
          setAddresses(data.addresses);
          useAuthStore.setState({ user: { ...user, addresses: data.addresses } });
          toast.success('Address updated successfully');
          setShowModal(false);
        }
      } else {
        const { data } = await api.post('/auth/addresses', payload);
        if (data.success) {
          setAddresses(data.addresses);
          useAuthStore.setState({ user: { ...user, addresses: data.addresses } });
          toast.success('Address added successfully');
          setShowModal(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addrId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await api.delete(`/auth/addresses/${addrId}`);
      if (data.success) {
        setAddresses(data.addresses);
        useAuthStore.setState({ user: { ...user, addresses: data.addresses } });
        toast.success('Address deleted successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Account Link */}
      <Link href="/account" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-6 text-sm font-semibold">
        <HiOutlineArrowLeft size={16} /> Back to Account
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-neutral-900 dark:text-white font-bold text-2xl" style={{ fontFamily: 'Outfit' }}>Saved Addresses</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage your shipping addresses for faster checkout.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={openAddModal}
          className="btn-primary py-3 px-5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
        >
          <HiPlus size={16} /> Add Address
        </motion.button>
      </div>

      {addresses.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-16">
          <HiOutlineLocationMarker size={48} className="text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">No saved addresses found</p>
          <button onClick={openAddModal} className="btn-ghost text-neutral-900 dark:text-white text-sm font-semibold mt-4">
            Add your first address
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <motion.div
              layout
              key={addr._id}
              className={`glass-card p-5 relative border transition-all ${
                addr.isDefault 
                  ? 'border-neutral-900 dark:border-white/20 bg-neutral-50/50 dark:bg-white/[0.01]' 
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2.5 py-1">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-900 dark:text-white bg-neutral-200/50 dark:bg-white/10 px-2 py-0.5 flex items-center gap-1">
                      <HiOutlineCheck size={10} /> Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-all rounded-md"
                    title="Edit Address"
                  >
                    <HiPencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-md"
                    title="Delete Address"
                  >
                    <HiTrash size={15} />
                  </button>
                </div>
              </div>

              <h3 className="text-neutral-900 dark:text-white font-semibold text-sm mb-1">{addr.fullName}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">{addr.phone}</p>
              
              <div className="text-neutral-500 dark:text-neutral-400 text-xs space-y-0.5 leading-relaxed">
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                {addr.landmark && <p className="text-neutral-400 dark:text-neutral-500 italic">Landmark: {addr.landmark}</p>}
                <p>{addr.city}, {addr.state} - <span className="text-neutral-900 dark:text-white font-semibold">{addr.pincode}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
            >
              <h2 className="text-neutral-900 dark:text-white font-bold text-lg mb-6" style={{ fontFamily: 'Outfit' }}>
                {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="Receivers name"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                    placeholder="Flat, House no., Building, Company, Apartment"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                    placeholder="Area, Street, Sector, Village"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="e.g. Near Apollo Hospital"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="6-digit PIN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="Town / City"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-2.5 px-3 text-neutral-900 dark:text-white text-xs focus:outline-none transition-colors"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    Address Label
                  </label>
                  <div className="flex gap-2">
                    {['home', 'work', 'other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLabel(type)}
                        className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border rounded-xl transition-all ${
                          label === type
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-brand-500 rounded focus:ring-brand-500 focus:ring-offset-neutral-950 focus:ring-1"
                  />
                  <label htmlFor="isDefault" className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold select-none cursor-pointer">
                    Set as Default Shipping Address
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2.5 px-4 text-xs uppercase tracking-wider font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary py-2.5 px-5 text-xs uppercase tracking-wider font-bold"
                  >
                    {submitting ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
