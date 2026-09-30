import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-serif text-white mb-4">TheWeddingSpace</h3>
          <p className="text-sm text-gray-400">
            Making your dream wedding a reality with our premium venues, catering, decoration, and photography services.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/halls" className="hover:text-rose-400">Our Halls</Link></li>
            <li><Link href="/catering" className="hover:text-rose-400">Catering Menu</Link></li>
            <li><Link href="/decoration" className="hover:text-rose-400">Decoration</Link></li>
            <li><Link href="/photography" className="hover:text-rose-400">Photography</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-rose-400">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-rose-400">Contact</Link></li>
            <li><Link href="/terms" className="hover:text-rose-400">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-rose-400">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: hello@theweddingspace.com</li>
            <li>Phone: +91-9876543210</li>
            <li>Address: 123 Wedding Space HQ, Mumbai</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} TheWeddingSpace. All rights reserved.
      </div>
    </footer>
  );
}
