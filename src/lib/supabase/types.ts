export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      halls: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          capacity_min: number | null;
          capacity_max: number | null;
          base_price: number | null;
          price_per_plate_veg: number | null;
          price_per_plate_nonveg: number | null;
          advance_percent: number | null;
          amenities: string[] | null;
          images: string[] | null;
          cover_image: string | null;
          is_active: boolean | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          capacity_min?: number | null;
          capacity_max?: number | null;
          base_price?: number | null;
          price_per_plate_veg?: number | null;
          price_per_plate_nonveg?: number | null;
          advance_percent?: number | null;
          amenities?: string[] | null;
          images?: string[] | null;
          cover_image?: string | null;
          is_active?: boolean | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          capacity_min?: number | null;
          capacity_max?: number | null;
          base_price?: number | null;
          price_per_plate_veg?: number | null;
          price_per_plate_nonveg?: number | null;
          advance_percent?: number | null;
          amenities?: string[] | null;
          images?: string[] | null;
          cover_image?: string | null;
          is_active?: boolean | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hall_blocked_dates: {
        Row: {
          id: string;
          hall_id: string | null;
          blocked_date: string;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hall_id?: string | null;
          blocked_date: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hall_id?: string | null;
          blocked_date?: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image: string | null;
          price_per_plate: number | null;
          is_veg: boolean | null;
          is_active: boolean | null;
          cuisine: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          image?: string | null;
          price_per_plate?: number | null;
          is_veg?: boolean | null;
          is_active?: boolean | null;
          cuisine?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          image?: string | null;
          price_per_plate?: number | null;
          is_veg?: boolean | null;
          is_active?: boolean | null;
          cuisine?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      decoration_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          images: string[] | null;
          cover_image: string | null;
          includes: string[] | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          images?: string[] | null;
          cover_image?: string | null;
          includes?: string[] | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          images?: string[] | null;
          cover_image?: string | null;
          includes?: string[] | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      photography_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          duration_hours: number | null;
          features: string[] | null;
          images: string[] | null;
          cover_image: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          duration_hours?: number | null;
          features?: string[] | null;
          images?: string[] | null;
          cover_image?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          duration_hours?: number | null;
          features?: string[] | null;
          images?: string[] | null;
          cover_image?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          hall_id: string | null;
          event_date: string;
          event_type: string | null;
          guest_count: number | null;
          decoration_package_id: string | null;
          photography_package_id: string | null;
          hall_amount: number | null;
          food_amount: number | null;
          decoration_amount: number | null;
          photography_amount: number | null;
          subtotal: number | null;
          gst_amount: number | null;
          total_amount: number | null;
          advance_amount: number | null;
          balance_amount: number | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null;
          payment_status: 'unpaid' | 'advance_paid' | 'paid' | 'refunded' | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          special_requests: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          hall_id?: string | null;
          event_date: string;
          event_type?: string | null;
          guest_count?: number | null;
          decoration_package_id?: string | null;
          photography_package_id?: string | null;
          hall_amount?: number | null;
          food_amount?: number | null;
          decoration_amount?: number | null;
          photography_amount?: number | null;
          subtotal?: number | null;
          gst_amount?: number | null;
          total_amount?: number | null;
          advance_amount?: number | null;
          balance_amount?: number | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null;
          payment_status?: 'unpaid' | 'advance_paid' | 'paid' | 'refunded' | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          special_requests?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          hall_id?: string | null;
          event_date?: string;
          event_type?: string | null;
          guest_count?: number | null;
          decoration_package_id?: string | null;
          photography_package_id?: string | null;
          hall_amount?: number | null;
          food_amount?: number | null;
          decoration_amount?: number | null;
          photography_amount?: number | null;
          subtotal?: number | null;
          gst_amount?: number | null;
          total_amount?: number | null;
          advance_amount?: number | null;
          balance_amount?: number | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null;
          payment_status?: 'unpaid' | 'advance_paid' | 'paid' | 'refunded' | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          special_requests?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_food_items: {
        Row: {
          id: string;
          booking_id: string | null;
          food_item_id: string | null;
          quantity: number | null;
          unit_price: number | null;
          line_total: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          food_item_id?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          line_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          food_item_id?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          line_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount: number | null;
          currency: string | null;
          status: string | null;
          method: string | null;
          raw_response: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount?: number | null;
          currency?: string | null;
          status?: string | null;
          method?: string | null;
          raw_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount?: number | null;
          currency?: string | null;
          status?: string | null;
          method?: string | null;
          raw_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_enquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          gst_percent: number | null;
          default_advance_percent: number | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          razorpay_key_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          gst_percent?: number | null;
          default_advance_percent?: number | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          razorpay_key_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          gst_percent?: number | null;
          default_advance_percent?: number | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          razorpay_key_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
