'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  UtensilsCrossed, 
  Sparkles, 
  Camera, 
  CalendarCheck, 
  CreditCard, 
  Settings 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const links = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Halls', href: '/admin/halls', icon: <Building2 size={20} /> },
    { name: 'Food & Catering', href: '/admin/food', icon: <UtensilsCrossed size={20} /> },
    { name: 'Decoration', href: '/admin/decoration', icon: <Sparkles size={20} /> },
    { name: 'Photography', href: '/admin/photography', icon: <Camera size={20} /> },
    { name: 'Bookings', href: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Payments', href: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold font-serif text-rose-500">Admin Panel</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active ? 'bg-rose-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className={`mr-3 ${active ? 'text-white' : 'text-gray-400'}`}>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-6 md:hidden">
          <h2 className="text-xl font-bold font-serif text-rose-600">Admin Panel</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
