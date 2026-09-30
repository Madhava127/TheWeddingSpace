import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { Search, MapPin, Users, CalendarDays, Star, ArrowRight } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const { data: halls } = await supabase
    .from('halls')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80"
            alt="Wedding Hall"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-lg">
            Find the Perfect Venue for Your Perfect Day
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Discover and book premium marriage halls, exquisite catering, stunning decoration, and professional photography all in one place.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-4 max-w-3xl mx-auto">
            <div className="flex items-center flex-1 w-full px-4 border-r border-gray-200">
              <MapPin className="text-rose-500 mr-2" size={20} />
              <input type="text" placeholder="City or Location" className="w-full outline-none text-gray-700 bg-transparent" />
            </div>
            <div className="flex items-center flex-1 w-full px-4 border-r border-gray-200">
              <CalendarDays className="text-rose-500 mr-2" size={20} />
              <input type="date" className="w-full outline-none text-gray-700 bg-transparent" />
            </div>
            <div className="flex items-center flex-1 w-full px-4">
              <Users className="text-rose-500 mr-2" size={20} />
              <input type="number" placeholder="Guests" className="w-full outline-none text-gray-700 bg-transparent" />
            </div>
            <Link href="/halls" className="w-full md:w-auto mt-4 md:mt-0">
              <Button className="w-full md:w-auto rounded-full bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg h-full">
                <Search className="mr-2" size={20} /> Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Halls */}
      <section className="py-20 px-4 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Featured Venues</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Explore our handpicked selection of the most beautiful and sought-after marriage halls.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {halls?.map((hall: any) => (
            <Link href={`/halls/${hall.id}`} key={hall.id} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={hall.cover_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'}
                    alt={hall.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center text-sm font-semibold text-amber-600">
                    <Star size={16} className="fill-current mr-1" />
                    {hall.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>
                  <div className="flex items-center text-gray-500 mb-4 text-sm">
                    <MapPin size={16} className="mr-1" /> {hall.city}, {hall.state}
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="text-lg font-bold text-rose-600">₹{hall.base_price}</p>
                    </div>
                    <div className="flex items-center text-rose-600 font-medium group-hover:underline">
                      View Details <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/halls">
            <Button variant="outline" size="lg" className="border-rose-200 text-rose-600 hover:bg-rose-50">
              View All Venues
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-rose-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide comprehensive services to make your wedding day stress-free and magical.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Venues', desc: 'Premium halls and lawns', link: '/halls', icon: '🏰' },
              { title: 'Catering', desc: 'Exquisite multi-cuisine menus', link: '/catering', icon: '🍽️' },
              { title: 'Decoration', desc: 'Stunning floral & thematic decor', link: '/decoration', icon: '✨' },
              { title: 'Photography', desc: 'Capturing memories forever', link: '/photography', icon: '📸' }
            ].map((service, i) => (
              <Link href={service.link} key={i}>
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-all border border-rose-100 group hover:border-rose-300">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{service.desc}</p>
                  <span className="text-rose-600 text-sm font-medium inline-flex items-center group-hover:underline">
                    Explore <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Book your entire wedding in just a few simple steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
          {[
            { step: '01', title: 'Find a Venue', desc: 'Search for halls based on your location and capacity needs.' },
            { step: '02', title: 'Pick Services', desc: 'Select catering, decoration, and photography packages.' },
            { step: '03', title: 'Check Availability', desc: 'Verify your event date against our real-time calendar.' },
            { step: '04', title: 'Book & Pay', desc: 'Pay a secure advance online to confirm your booking instantly.' }
          ].map((item, i) => (
            <div key={i} className="bg-white pt-8 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-rose-200">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to plan your dream wedding?</h2>
          <p className="text-lg text-gray-300 mb-10">Join thousands of happy couples who trusted TheWeddingSpace for their big day.</p>
          <Link href="/halls">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-full">
              Start Booking Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
