export type Role = "admin" | "vendeur" | "acheteur";
export type ProductStatus = "en_attente" | "valide" | "rejete" | "vendu";
export type ConversationStatus = "ouverte" | "vente_confirmee" | "annulee";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: Role;
          whatsapp?: string;
          city?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: Role;
          whatsapp?: string;
          city?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: Role;
          whatsapp?: string;
          city?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          price_gnf: number;
          city: string;
          category: string;
          image_url: string;
          seller_id: string;
          seller_name: string;
          seller_whatsapp: string;
          verified: boolean;
          status: ProductStatus;
          created_at: string;
          faq: { q: string; a: string }[];
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description: string;
          price_gnf: number;
          city: string;
          category: string;
          image_url: string;
          seller_id: string;
          seller_name: string;
          seller_whatsapp: string;
          verified?: boolean;
          status?: ProductStatus;
          created_at?: string;
          faq?: { q: string; a: string }[];
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string;
          price_gnf?: number;
          city?: string;
          category?: string;
          image_url?: string;
          seller_id?: string;
          seller_name?: string;
          seller_whatsapp?: string;
          verified?: boolean;
          status?: ProductStatus;
          created_at?: string;
          faq?: { q: string; a: string }[];
        };
      };
      conversations: {
        Row: {
          id: string;
          product_id: string;
          product_code: string;
          product_title: string;
          product_image_url: string;
          price_gnf: number;
          buyer_id?: string;
          buyer_name: string;
          buyer_email?: string;
          buyer_whatsapp?: string;
          seller_id: string;
          seller_name: string;
          seller_whatsapp: string;
          message: string;
          status: ConversationStatus;
          created_at: string;
          last_message_at: string;
          confirmed_at?: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_code: string;
          product_title: string;
          product_image_url: string;
          price_gnf: number;
          buyer_id?: string;
          buyer_name: string;
          buyer_email?: string;
          buyer_whatsapp?: string;
          seller_id: string;
          seller_name: string;
          seller_whatsapp: string;
          message: string;
          status?: ConversationStatus;
          created_at?: string;
          last_message_at?: string;
          confirmed_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_code?: string;
          product_title?: string;
          product_image_url?: string;
          price_gnf?: number;
          buyer_id?: string;
          buyer_name?: string;
          buyer_email?: string;
          buyer_whatsapp?: string;
          seller_id?: string;
          seller_name?: string;
          seller_whatsapp?: string;
          message?: string;
          status?: ConversationStatus;
          created_at?: string;
          last_message_at?: string;
          confirmed_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
