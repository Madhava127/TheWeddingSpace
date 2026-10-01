import Link from 'next/link';
export const metadata = { title: 'About — TheWeddingSpace' };
const features = [
  { icon: '🏛️', title: 'Verified Venues', desc: 'Every hall is personally inspected and quality-checked before listing.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges. See hall rent, per-plate cost, and add-ons upfront.' },
  { icon: '✨', title: 'One-Stop Booking', desc: 'Hall, catering, decoration, and photography — all in a single flow.' },
  { icon: '🤝', title: 'Trusted Vendors', desc: 'Our partner chefs, decorators, and photographers are vetted professionals.' },
];
const stats = [
  { value: '500+', label: 'Weddings Hosted' },
  { value: '50+', label: 'Partner Venues' },
  { value: '10+', label: 'Cities' },
  { value: '4.9', label: 'Average Rating' },
];
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-rose-50/30">
      <section className="bg-gradient-to-b from-rose-100 to-rose-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-rose-900 mb-6">Making Weddings Effortless</h1>
          <p className="text-lg md:text-xl text-rose-800/80 max-w-2xl mx-auto leading-relaxed">TheWeddingSpace is India&apos;s simplest way to book a marriage hall, catering, decoration, and photography — all in one place.</p>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-center text-rose-900 mb-12">Why TheWeddingSpace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-rose-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl text-rose-900 mb-2">{f.title}</h3>
                <p className="text-rose-800/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-rose-900 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl md:text-5xl text-amber-400 mb-2">{s.value}</div>
              <div className="text-rose-100/80 text-sm uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-rose-900 mb-4">Ready to plan your big day?</h2>
        <Link href="/halls" className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium">Explore Venues</Link>
      </section>
    </main>
  );
}
