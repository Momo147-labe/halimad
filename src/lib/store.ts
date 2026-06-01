// Supabase-backed store for HaliMad
import { supabase } from "./supabase";
import type { Role, ProductStatus, ConversationStatus, Product, Conversation, Profile } from "./supabase-types";

export type { Role, ProductStatus, ConversationStatus, Product, Conversation, Profile };

export const GUINEA_CITIES = [
  "Conakry",
  "Kankan",
  "Nzérékoré",
  "Kindia",
  "Labé",
  "Boké",
  "Mamou",
  "Faranah",
  "Siguiri",
  "Kissidougou",
];

export const CATEGORIES = [
  "Téléphones",
  "Électroménager",
  "Mode",
  "Voitures",
  "Immobilier",
  "Alimentation",
  "Beauté",
  "Services",
];

// Auth functions
export async function signUp(email: string, password: string, name: string, role: Role, whatsapp?: string, city?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        whatsapp,
        city,
      }
    }
  });

  if (error) throw error;

  // Si l'utilisateur est connecté immédiatement (pas de confirmation d'email),
  // on met à jour le profil pour s'assurer que tous les champs (comme whatsapp) sont bien enregistrés,
  // car le trigger côté base de données crée déjà la ligne mais n'inclut peut-être pas whatsapp.
  if (data.session && data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        name,
        role,
        whatsapp,
        city,
      })
      .eq("id", data.user.id);

    if (profileError) throw profileError;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile || null;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(product: Omit<Product, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      price_gnf: product.price_gnf,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      seller_whatsapp: product.seller_whatsapp,
      image_url: product.image_url,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const updateData: any = { ...patch };
  if (patch.price_gnf !== undefined) updateData.price_gnf = patch.price_gnf;
  if (patch.seller_id !== undefined) updateData.seller_id = patch.seller_id;
  if (patch.seller_name !== undefined) updateData.seller_name = patch.seller_name;
  if (patch.seller_whatsapp !== undefined) updateData.seller_whatsapp = patch.seller_whatsapp;
  if (patch.image_url !== undefined) updateData.image_url = patch.image_url;

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Conversation functions
export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createConversation(conversation: Omit<Conversation, "id" | "created_at" | "last_message_at">) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      ...conversation,
      price_gnf: conversation.price_gnf,
      product_id: conversation.product_id,
      product_code: conversation.product_code,
      product_title: conversation.product_title,
      product_image_url: conversation.product_image_url,
      buyer_id: conversation.buyer_id,
      buyer_name: conversation.buyer_name,
      buyer_email: conversation.buyer_email,
      buyer_whatsapp: conversation.buyer_whatsapp,
      seller_id: conversation.seller_id,
      seller_name: conversation.seller_name,
      seller_whatsapp: conversation.seller_whatsapp,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertConversation(conversation: Omit<Conversation, "id" | "created_at" | "last_message_at">) {
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("product_id", conversation.product_id)
    .eq("buyer_email", conversation.buyer_email)
    .eq("status", "ouverte")
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("conversations")
      .update({
        buyer_name: conversation.buyer_name,
        buyer_whatsapp: conversation.buyer_whatsapp,
        message: conversation.message,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    return createConversation(conversation);
  }
}

export async function updateConversation(id: string, patch: Partial<Conversation>) {
  const updateData: any = { ...patch };
  if (patch.price_gnf !== undefined) updateData.price_gnf = patch.price_gnf;
  if (patch.product_id !== undefined) updateData.product_id = patch.product_id;
  if (patch.product_code !== undefined) updateData.product_code = patch.product_code;
  if (patch.product_title !== undefined) updateData.product_title = patch.product_title;
  if (patch.product_image_url !== undefined) updateData.product_image_url = patch.product_image_url;
  if (patch.buyer_id !== undefined) updateData.buyer_id = patch.buyer_id;
  if (patch.buyer_name !== undefined) updateData.buyer_name = patch.buyer_name;
  if (patch.buyer_email !== undefined) updateData.buyer_email = patch.buyer_email;
  if (patch.buyer_whatsapp !== undefined) updateData.buyer_whatsapp = patch.buyer_whatsapp;
  if (patch.seller_id !== undefined) updateData.seller_id = patch.seller_id;
  if (patch.seller_name !== undefined) updateData.seller_name = patch.seller_name;
  if (patch.seller_whatsapp !== undefined) updateData.seller_whatsapp = patch.seller_whatsapp;

  const { data, error } = await supabase
    .from("conversations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Image upload to Supabase Storage
export async function uploadProductImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from("products-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("products-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export function formatGNF(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " GNF";
}

export function generateTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "HMD-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
