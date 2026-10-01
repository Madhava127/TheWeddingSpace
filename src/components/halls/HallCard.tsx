import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HallCard({ hall }: { hall: any }) {
  const coverImage = hall.cover_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80';
  const amenities = Array.isArray(hall.amenities) ? hall.amenities : [];

  return (
    <div className="group overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={coverImage}
            alt={hall.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-amber-600 shadow-sm">
          <Star className="h-4 w-4 fill-current" />
          {hall.rating ?? '4.9'}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">{hall.name}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>{hall.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-rose-500" />
          <span>
            {hall.capacity_min ?? 100} - {hall.capacity_max ?? 500} guests
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {amenities.slice(0, 3).map((item: string) => (
            <span key={item} className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              {item}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className="rounded-full border border-rose-100 bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
              +{amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-rose-100 pt-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-2xl font-bold text-rose-600">₹{Number(hall.base_price ?? 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">/ day</p>
          </div>

          <Link href={`/book?hall=${hall.id}`}>
            <Button className="bg-rose-600 text-white hover:bg-rose-700">Book Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
