// Shared constants for Vyamoh platform
module.exports = {
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
    REFUNDED: 'refunded',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    COD_PENDING: 'cod_pending',
    COD_COLLECTED: 'cod_collected',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  PAYMENT_METHOD: {
    RAZORPAY: 'razorpay',
    UPI: 'upi',
    COD: 'cod',
    CARD: 'card',
    NETBANKING: 'netbanking',
    WALLET: 'wallet',
  },

  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
  },

  FRAUD_RISK: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },

  PRODUCT_CATEGORIES: {
    SUNGLASSES: 'sunglasses',
    EYEGLASSES: 'eyeglasses',
    ACCESSORIES: 'accessories',
  },

  COUPON_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    FREE_SHIPPING: 'free_shipping',
  },
};
