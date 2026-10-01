'use client';

import { ArrowRight } from 'lucide-react';

export function PriceBreakdown({
  hall,
  foodItems = [],
  decoration,
  photography,
  gstPercent = 0,
  advancePercent = 0,
}: {
  hall: any;
  foodItems?: any[];
  decoration?: any | null;
  photography?: any | null;
  gstPercent?: number;
  advancePercent?: number;
}) {
  const hallAmount = Number(hall?.base_price ?? 0);
  const foodAmount = foodItems.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.price_per_plate ?? 0), 0);
  const decorationAmount = Number(decoration?.price ?? 0);
  const photographyAmount = Number(photography?.price ?? 0);
  const subtotal = hallAmount + foodAmount + decorationAmount + photographyAmount;
  const gst = subtotal * (Number(gstPercent) / 100);
  const total = subtotal + gst;
  const advance = total * (Number(advancePercent) / 100);
  const balance = total - advance;

  const rows = [
    { label: 'Hall booking', value: hallAmount },
    { label: 'Food', value: foodAmount },
    { label: 'Decoration', value: decorationAmount },
    { label: 'Photography', value: photographyAmount },
    { label: 'Subtotal', value: subtotal },
    { label: `GST (${gstPercent}%)`, value: gst },
    { label: 'Total', value: total },
    { label: `Advance payable (${advancePercent}%)`, value: advance, highlight: true },
    { label: 'Balance due later', value: balance },
  ];

  return (
    <aside className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm md:sticky md:top-24">
      <h3 className="mb-5 text-xl font-bold text-gray-900">Price Summary</h3>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between border-b border-gray-100 pb-2 last:border-none ${row.highlight ? 'text-amber-700' : 'text-gray-700'}`}
          >
            <span className="text-sm">{row.label}</span>
            <span className={`font-semibold ${row.highlight ? 'text-amber-700' : 'text-gray-900'}`}>
              ₹{Number(row.value).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-800">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Advance Payable Now</span>
          <span className="text-lg font-bold">₹{advance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Balance Due Later</span>
        <span className="font-semibold text-gray-900">₹{balance.toLocaleString('en-IN')}</span>
      </div>
    </aside>
  );
}
