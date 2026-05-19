'use client';
import { motion } from 'framer-motion';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-6" style={{ fontFamily: 'Outfit' }}>
          Terms & Conditions
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
          Last updated: May 19, 2026
        </p>

        <div className="space-y-8 text-neutral-600 dark:text-neutral-350 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and placing an order on www.vyamoh.com, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use the services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              2. Products and Orders
            </h2>
            <p>
              All products listed are subject to availability. We make every effort to display the colors and details of our sunglasses as accurately as possible. We reserve the right to refuse or cancel any order for reason of inventory limitations or incorrect details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              3. Payments and Shipping
            </h2>
            <p>
              Payment must be completed in full at the time of checkout unless Cash on Delivery is selected. Shipping timelines provided are estimates and subject to standard carrier terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              4. Returns and Exchanges
            </h2>
            <p>
              We offer free returns and exchanges on all eligible pairs of sunglasses within the period specified in our Return Policy, provided the product is in its original packaging and condition.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
