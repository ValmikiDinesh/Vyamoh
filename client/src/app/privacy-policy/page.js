'use client';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-6" style={{ fontFamily: 'Outfit' }}>
          Privacy Policy
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
          Last updated: May 19, 2026
        </p>

        <div className="space-y-8 text-neutral-600 dark:text-neutral-350 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when purchasing our premium eyewear, creating an account, or subscribing to our newsletter. This includes your name, email address, shipping and billing address, and phone number.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              2. How We Use Your Information
            </h2>
            <p>
              We use the collected information to process and fulfill your orders, send order updates, respond to customer service inquiries, and improve our services and design offerings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to safeguard your personal data. Payment transactions are processed securely through certified Razorpay gateway integration, and we do not store raw credit/debit card information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              4. Cookies and Analytics
            </h2>
            <p>
              VYAMOH uses cookies to optimize your browsing experience, manage items in your shopping bag, and understand traffic behavior to build better design systems.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
