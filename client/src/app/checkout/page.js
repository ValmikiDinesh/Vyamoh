'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineCreditCard, HiOutlineCash, HiOutlineDeviceMobile, HiOutlineTag } from 'react-icons/hi';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', label: 'home' });
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchCart();
    if (user.addresses?.length > 0) setSelectedAddress(user.addresses.find((a) => a.isDefault) || user.addresses[0]);
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 99900 ? 0 : 4900;
  const total = subtotal + shipping - couponDiscount;

  const applyCoupon = async () => {
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponDiscount(data.coupon.discount);
      setCouponMessage(data.message);
      toast.success(data.message);
    } catch (err) {
      setCouponMessage('');
      setCouponDiscount(0);
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all required shipping coordinates');
      return;
    }
    try {
      const { data } = await api.post('/auth/addresses', newAddress);
      const addrs = data.addresses;
      setSelectedAddress(addrs[addrs.length - 1]);
      setShowAddAddress(false);
      toast.success('Address added');
    } catch (err) { toast.error('Failed to add address'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Select a delivery address'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: selectedAddress, paymentMethod, couponCode, customerNote: '',
        otpVerified: otpRequired ? true : undefined,
      });

      if (data.requiresOtp) {
        setOtpRequired(true);
        toast('OTP sent to your phone for COD verification', { icon: '📱' });
        setLoading(false);
        return;
      }

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        router.push(`/account/orders/${data.order._id}`);
      } else if (data.razorpayOrder) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: 'INR',
          name: 'Vyamoh',
          description: `Order ${data.order.orderNumber}`,
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            try {
              await api.post('/orders/verify-payment', { ...response, orderId: data.order._id });
              toast.success('Payment successful!');
              router.push(`/account/orders/${data.order._id}`);
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: { name: user.name, email: user.email, contact: selectedAddress.phone },
          theme: { color: '#000000' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    finally { setLoading(false); }
  };

  const verifyCodOtp = async () => {
    try {
      await api.post('/orders/verify-cod-otp', { phone: selectedAddress.phone, otp, purpose: 'cod_verification' });
      setOtpRequired(false);
      placeOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
  };

  const paymentOptions = [
    { id: 'razorpay', label: 'Card / UPI / Netbanking', icon: HiOutlineCreditCard, sub: 'Pay securely via Razorpay Gateway' },
    { id: 'cod', label: 'Cash on Delivery (COD)', icon: HiOutlineCash, sub: 'Pay securely when you receive product' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ fontFamily: 'Outfit' }}>Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Delivery Coordinates Panel */}
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900 p-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'Outfit' }}>Delivery Address</h2>
            
            {user?.addresses?.length > 0 && !showAddAddress ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;
                    return (
                      <button key={addr._id} onClick={() => setSelectedAddress(addr)}
                        className={`w-full text-left p-6 border transition-all flex flex-col justify-between h-44 ${isSelected ? 'border-black dark:border-white bg-neutral-100/50 dark:bg-neutral-950/30' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'}`}>
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5">{addr.label}</span>
                          {addr.isDefault && <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Default</span>}
                        </div>
                        <div className="mt-3">
                          <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{addr.fullName}</p>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1 truncate">{addr.addressLine1}</p>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs truncate">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-semibold mt-2">📞 {addr.phone}</p>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setShowAddAddress(true)} className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors mt-2 block">
                  + Add New Coordinates
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="input-field text-xs bg-transparent" required />
                  <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-field text-xs bg-transparent" required />
                </div>
                <input placeholder="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} className="input-field text-xs bg-transparent" required />
                <input placeholder="Address Line 2" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} className="input-field text-xs bg-transparent" />
                <input placeholder="Landmark" value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} className="input-field text-xs bg-transparent" />
                <div className="grid grid-cols-3 gap-4">
                  <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field text-xs bg-transparent" required />
                  <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field text-xs bg-transparent" required />
                  <input placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="input-field text-xs bg-transparent" required />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button onClick={handleAddAddress} className="bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-bold tracking-widest py-3 px-8 hover:opacity-90 transition-all">
                    Save Coordinates
                  </button>
                  {user?.addresses?.length > 0 && (
                    <button onClick={() => setShowAddAddress(false)} className="text-neutral-400 hover:text-black dark:hover:text-white text-xs uppercase font-bold tracking-widest px-6 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Selector Panel */}
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900 p-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'Outfit' }}>Payment Method</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                    className={`w-full flex items-start gap-4 p-6 border transition-all text-left ${isSelected ? 'border-black dark:border-white bg-neutral-100/50 dark:bg-neutral-950/30' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'}`}>
                    <opt.icon size={22} className={isSelected ? 'text-black dark:text-white' : 'text-neutral-400'} />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider">{opt.label}</p>
                      <p className="text-neutral-400 text-[10px] mt-1 italic font-light leading-relaxed">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. OTP verification panel */}
          {otpRequired && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-amber-500/40 p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-2">📱 COD Verification OTP Required</h3>
              <p className="text-neutral-400 text-xs mb-4">Enter the secure authentication OTP code sent to your phone {selectedAddress?.phone}</p>
              <div className="flex gap-3 max-w-sm">
                <input type="text" placeholder="Enter OTP Code" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field text-xs bg-transparent" maxLength={6} />
                <button onClick={verifyCodOtp} className="bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-bold tracking-widest px-6 hover:opacity-90">Verify Code</button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Checkout Order Summary */}
        <div>
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900 p-8 sticky top-32">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'Outfit' }}>Summary Stack</h3>
            
            <div className="space-y-4 mb-6 border-b border-neutral-200/60 dark:border-neutral-800/80 pb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-start text-xs gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Promo codes */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <HiOutlineTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                <input placeholder="PROMO CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input-field text-xs py-2.5 pl-9 bg-transparent" />
              </div>
              <button onClick={applyCoupon} className="bg-neutral-200 dark:bg-neutral-800 hover:opacity-80 text-black dark:text-white text-[10px] uppercase font-bold tracking-wider px-4 transition-colors">Apply</button>
            </div>
            {couponMessage && <p className="text-emerald-500 text-[10px] uppercase tracking-wider font-semibold mb-4">{couponMessage}</p>}

            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-200/60 dark:border-neutral-800/80 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-light">Subtotal</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-light">Shipping</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {shipping === 0 ? <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Free</span> : formatPrice(shipping)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500 font-bold">Discount</span>
                  <span className="text-emerald-500 font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-sm font-extrabold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">{formatPrice(total)}</span>
            </div>

            <button onClick={placeOrder} disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black text-center font-bold text-xs uppercase tracking-widest py-4 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : `Complete Payment (${formatPrice(total)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
