import Razorpay from 'razorpay';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  _razorpay = new Razorpay({ key_id, key_secret });
  return _razorpay;
}