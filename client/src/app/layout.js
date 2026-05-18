import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'Vyamoh — Premium Eyewear for Every Vibe',
  description: 'Shop premium sunglasses online at Vyamoh. Aviators, Wayfarers, Round, Cat Eye & Sports sunglasses with UV400 protection. Free shipping across India on orders above ₹999.',
  keywords: ['sunglasses', 'eyewear', 'buy sunglasses online', 'premium sunglasses India', 'Vyamoh', 'aviator sunglasses', 'UV400'],
  openGraph: {
    title: 'Vyamoh — Premium Eyewear for Every Vibe',
    description: 'Discover premium sunglasses crafted for the Indian lifestyle. Shop aviators, wayfarers, and more.',
    type: 'website',
    siteName: 'Vyamoh',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{
            style: { background: '#2d2e33', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
            success: { iconTheme: { primary: '#e85d3a', secondary: '#fff' } },
          }} />
          <Header />
          <main className="flex-1 pt-[calc(4rem+28px)] md:pt-[calc(5rem+28px)]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
