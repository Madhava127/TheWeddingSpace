'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function BookingWizard({
  halls,
  blockedDates,
  foodCategories,
  foodItems,
  decorationPackages,
  photographyPackages,
  settings,
  initialHallId
}: any) {
  const store = useBookingStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { openCheckout } = useRazorpay();
  const router = useRouter();

  useEffect(() => {
    if (initialHallId && !store.hallId) {
      store.setHallId(initialHallId);
    }
  }, [initialHallId]);

  const selectedHall = halls.find((h: any) => h.id === store.hallId);
  const selectedDeco = decorationPackages.find((d: any) => d.id === store.decorationPackageId);
  const selectedPhoto = photographyPackages.find((p: any) => p.id === store.photographyPackageId);

  // Derived calculations
  const hallAmount = selectedHall?.base_price || 0;
  
  let foodAmount = 0;
  store.foodItems.forEach((item: any) => {
    const dbItem = foodItems.find((f: any) => f.id === item.id);
    if (dbItem) {
      foodAmount += (dbItem.price_per_plate * item.quantity);
    }
  });

  const decoAmount = selectedDeco?.price || 0;
  const photoAmount = selectedPhoto?.price || 0;
  const subtotal = hallAmount + foodAmount + decoAmount + photoAmount;
  const gstAmount = (subtotal * settings.gst_percent) / 100;
  const totalAmount = subtotal + gstAmount;
  const advancePercent = selectedHall?.advance_percent || settings.default_advance_percent;
  const advanceAmount = (totalAmount * advancePercent) / 100;

  const nextStep = () => {
    // Validations
    if (currentStep === 1 && !store.hallId) {
      return toast.error('Please select a venue');
    }
    if (currentStep === 2 && !store.eventDate) {
      return toast.error('Please select an event date');
    }
    if (currentStep === 3) {
      if (!store.customerName || !store.customerEmail || !store.customerPhone) {
        return toast.error('Please fill in all contact details');
      }
      if (selectedHall && (store.guestCount < selectedHall.capacity_min || store.guestCount > selectedHall.capacity_max)) {
        return toast.error(`Guests must be between ${selectedHall.capacity_min} and ${selectedHall.capacity_max}`);
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleConfirmAndPay = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Insert Booking
      const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
        user_id: user?.id || null,
        hall_id: store.hallId,
        event_date: store.eventDate ? new Date(store.eventDate).toISOString().split('T')[0] : null,
        event_type: store.eventType,
        guest_count: store.guestCount,
        decoration_package_id: store.decorationPackageId,
        photography_package_id: store.photographyPackageId,
        hall_amount: hallAmount,
        food_amount: foodAmount,
        decoration_amount: decoAmount,
        photography_amount: photoAmount,
        subtotal,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        balance_amount: totalAmount - advanceAmount,
        status: 'pending',
        payment_status: 'unpaid',
        customer_name: store.customerName,
        customer_email: store.customerEmail,
        customer_phone: store.customerPhone,
        special_requests: store.specialRequests,
      }).select().single();

      if (bookingError) throw bookingError;

      // 2. Insert Food Items
      if (store.foodItems.length > 0) {
        const foodInserts = store.foodItems.map((fi: any) => {
          const dbItem = foodItems.find((f: any) => f.id === fi.id);
          return {
            booking_id: booking.id,
            food_item_id: fi.id,
            quantity: fi.quantity,
            unit_price: dbItem?.price_per_plate || 0,
            line_total: (dbItem?.price_per_plate || 0) * fi.quantity
          };
        });
        await supabase.from('booking_food_items').insert(foodInserts);
      }

      // 3. Create Order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error);

      // 4. Open Razorpay
      openCheckout({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'TheWeddingSpace',
        description: `Advance for ${selectedHall?.name}`,
        prefill: {
          name: store.customerName,
          email: store.customerEmail,
          contact: store.customerPhone
        },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            store.reset();
            router.push(`/book/success?booking=${booking.id}`);
          } else {
            router.push(`/book/failure?booking=${booking.id}`);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            router.push(`/dashboard`);
          }
        }
      });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Booking failed');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Step {currentStep} of 6</h2>
            <div className="text-sm text-gray-500 font-medium">
              {['Venue', 'Date', 'Details', 'Catering', 'Add-ons', 'Summary'][currentStep - 1]}
            </div>
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Select Venue</h3>
                <div className="grid gap-4">
                  {halls.map((h: any) => (
                    <div 
                      key={h.id}
                      onClick={() => store.setHallId(h.id)}
                      className={`p-4 border rounded-xl cursor-pointer flex gap-4 transition-all ${store.hallId === h.id ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500' : 'hover:border-rose-200'}`}
                    >
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden shrink-0">
                        <img src={h.cover_image} alt={h.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{h.name}</h4>
                        <p className="text-sm text-gray-500">{h.city}</p>
                        <p className="font-medium text-rose-600 mt-2">₹{h.base_price}</p>
                      </div>
                      {store.hallId === h.id && <CheckCircle2 className="text-rose-500" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Select Event Date & Type</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500"
                      min={new Date().toISOString().split('T')[0]}
                      value={store.eventDate ? (store.eventDate as any).toISOString?.().split('T')[0] || store.eventDate : ''}
                      onChange={(e) => store.setEventDate(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Type</label>
                    <select 
                      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500"
                      value={store.eventType}
                      onChange={(e) => store.setEventType(e.target.value)}
                    >
                      <option>Wedding</option>
                      <option>Reception</option>
                      <option>Engagement</option>
                      <option>Corporate Event</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Guest Count & Details</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Guests</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500"
                    value={store.guestCount}
                    onChange={(e) => store.setGuestCount(parseInt(e.target.value) || 0)}
                  />
                  {selectedHall && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hall capacity: {selectedHall.capacity_min} - {selectedHall.capacity_max}
                    </p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg p-3 outline-none"
                      value={store.customerName}
                      onChange={(e) => store.setCustomerDetails({
                        name: e.target.value,
                        email: store.customerEmail,
                        phone: store.customerPhone,
                        specialRequests: store.specialRequests
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full border rounded-lg p-3 outline-none"
                      value={store.customerEmail}
                      onChange={(e) => store.setCustomerDetails({
                        name: store.customerName,
                        email: e.target.value,
                        phone: store.customerPhone,
                        specialRequests: store.specialRequests
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full border rounded-lg p-3 outline-none"
                    value={store.customerPhone}
                    onChange={(e) => store.setCustomerDetails({
                      name: store.customerName,
                      email: store.customerEmail,
                      phone: e.target.value,
                      specialRequests: store.specialRequests
                    })}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Catering Selection</h3>
                {foodCategories.map((cat: any) => (
                  <div key={cat.id} className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">{cat.name}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {foodItems.filter((f: any) => f.category_id === cat.id).map((item: any) => {
                        const isSelected = store.foodItems.find((fi: any) => fi.id === item.id);
                        return (
                          <div key={item.id} className={`p-4 border rounded-xl flex justify-between items-center ${isSelected ? 'border-rose-500 bg-rose-50' : ''}`}>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <p className="text-sm text-gray-500">₹{item.price_per_plate} / plate</p>
                            </div>
                            {isSelected ? (
                              <div className="flex items-center gap-3">
                                <input 
                                  type="number" 
                                  className="w-20 border rounded p-1 text-center" 
                                  value={isSelected.quantity}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value);
                                    if (qty > 0) {
                                      store.setFoodItems(store.foodItems.map((fi: any) => fi.id === item.id ? { ...fi, quantity: qty } : fi));
                                    } else {
                                      store.setFoodItems(store.foodItems.filter((fi: any) => fi.id !== item.id));
                                    }
                                  }}
                                />
                                <button className="text-red-500 text-sm" onClick={() => store.setFoodItems(store.foodItems.filter((fi: any) => fi.id !== item.id))}>Remove</button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => store.setFoodItems([...store.foodItems, { id: item.id, quantity: store.guestCount }])}>Add</Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Decoration Packages (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {decorationPackages.map((d: any) => (
                      <div 
                        key={d.id} 
                        onClick={() => store.setDecorationPackageId(store.decorationPackageId === d.id ? null : d.id)}
                        className={`p-4 border rounded-xl cursor-pointer ${store.decorationPackageId === d.id ? 'border-rose-500 bg-rose-50' : ''}`}
                      >
                        <h4 className="font-bold">{d.name}</h4>
                        <p className="text-rose-600 font-medium">₹{d.price}</p>
                        <p className="text-sm text-gray-500 mt-2">{d.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Photography Packages (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {photographyPackages.map((p: any) => (
                      <div 
                        key={p.id} 
                        onClick={() => store.setPhotographyPackageId(store.photographyPackageId === p.id ? null : p.id)}
                        className={`p-4 border rounded-xl cursor-pointer ${store.photographyPackageId === p.id ? 'border-rose-500 bg-rose-50' : ''}`}
                      >
                        <h4 className="font-bold">{p.name}</h4>
                        <p className="text-rose-600 font-medium">₹{p.price}</p>
                        <p className="text-sm text-gray-500 mt-2">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Venue</p>
                      <p className="font-medium">{selectedHall?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Event Date</p>
                      <p className="font-medium">{store.eventDate ? new Date(store.eventDate).toLocaleDateString() : 'Not selected'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Guests</p>
                      <p className="font-medium">{store.guestCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Customer</p>
                      <p className="font-medium">{store.customerName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep}><ChevronLeft className="mr-2" size={16} /> Back</Button>
            ) : <div></div>}
            
            {currentStep < 6 ? (
              <Button onClick={nextStep} className="bg-gray-900 text-white">Next <ChevronRight className="ml-2" size={16} /></Button>
            ) : (
              <Button onClick={handleConfirmAndPay} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white px-8">
                {loading ? 'Processing...' : `Pay Advance (₹${advanceAmount.toLocaleString('en-IN')})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Price Breakdown Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-900 text-white rounded-2xl p-6 sticky top-24">
          <h3 className="text-xl font-bold mb-6 font-serif">Price Breakdown</h3>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Venue Rental</span>
              <span>₹{hallAmount.toLocaleString('en-IN')}</span>
            </div>
            {foodAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Catering ({store.foodItems.length} items)</span>
                <span>₹{foodAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {decoAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Decoration</span>
                <span>₹{decoAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {photoAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Photography</span>
                <span>₹{photoAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-4 border-t border-gray-700 flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GST ({settings.gst_percent}%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Total Amount</span>
              <span className="text-xl font-bold text-rose-400">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">Advance Payable Now ({advancePercent}%)</span>
              <span className="font-bold">₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Balance Later</span>
              <span>₹{(totalAmount - advanceAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
