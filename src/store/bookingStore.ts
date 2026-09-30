import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type BookingState = {
  hallId: string | null;
  eventDate: Date | null;
  eventType: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  foodItems: Array<{ id: string; quantity: number }>;
  decorationPackageId: string | null;
  photographyPackageId: string | null;

  setHallId: (id: string | null) => void;
  setEventDate: (date: Date | null) => void;
  setEventType: (type: string) => void;
  setGuestCount: (count: number) => void;
  setCustomerDetails: (details: { name: string; email: string; phone: string; specialRequests: string }) => void;
  setFoodItems: (items: Array<{ id: string; quantity: number }>) => void;
  setDecorationPackageId: (id: string | null) => void;
  setPhotographyPackageId: (id: string | null) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      hallId: null,
      eventDate: null,
      eventType: 'Wedding',
      guestCount: 100,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      specialRequests: '',
      foodItems: [],
      decorationPackageId: null,
      photographyPackageId: null,

      setHallId: (id) => set({ hallId: id }),
      setEventDate: (date) => set({ eventDate: date }),
      setEventType: (type) => set({ eventType: type }),
      setGuestCount: (count) => set({ guestCount: count }),
      setCustomerDetails: (details) => set({ 
        customerName: details.name, 
        customerEmail: details.email, 
        customerPhone: details.phone, 
        specialRequests: details.specialRequests 
      }),
      setFoodItems: (items) => set({ foodItems: items }),
      setDecorationPackageId: (id) => set({ decorationPackageId: id }),
      setPhotographyPackageId: (id) => set({ photographyPackageId: id }),
      reset: () => set({
        hallId: null,
        eventDate: null,
        eventType: 'Wedding',
        guestCount: 100,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequests: '',
        foodItems: [],
        decorationPackageId: null,
        photographyPackageId: null,
      }),
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
