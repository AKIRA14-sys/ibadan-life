export interface OutfitOption {
  id: string;
  name: string;
  category: 'Male' | 'Female';
  style: string;
  topColor: string;
  bottomColor: string;
  accentColor: string;
  description: string;
}

export const MALE_OUTFITS: OutfitOption[] = [
  { id: 'm1', name: 'Casual Ibadan Streetwear', category: 'Male', style: 'T-Shirt & Jeans', topColor: '#2563eb', bottomColor: '#1e293b', accentColor: '#0f172a', description: 'Classic blue fitted tee with dark denim trousers.' },
  { id: 'm2', name: 'Ankara Native Agbada', category: 'Male', style: 'Traditional Native', topColor: '#d97706', bottomColor: '#92400e', accentColor: '#f59e0b', description: 'Rich gold & bronze patterned traditional native wear.' },
  { id: 'm3', name: 'Dugbe Trader Casual', category: 'Male', style: 'Polo & Chinos', topColor: '#16a34a', bottomColor: '#334155', accentColor: '#15803d', description: 'Emerald green polo shirt with durable slate chinos.' },
  { id: 'm4', name: 'Corporate Business Executive', category: 'Male', style: 'Formal Suit', topColor: '#0f172a', bottomColor: '#0f172a', accentColor: '#2563eb', description: 'Dark navy fitted suit for commercial meetings.' },
  { id: 'm5', name: 'Bodija Student Scholar', category: 'Male', style: 'Campus Casual', topColor: '#ea580c', bottomColor: '#1e293b', accentColor: '#f97316', description: 'Vibrant orange varsity hoodie and dark jeans.' },
  { id: 'm6', name: 'Iwo Road Conductor Attire', category: 'Male', style: 'Street Vendor', topColor: '#eab308', bottomColor: '#475569', accentColor: '#ca8a04', description: 'High-visibility yellow top with tough work denim.' },
  { id: 'm7', name: 'Royal Senator Native', category: 'Male', style: 'Senator Wear', topColor: '#ffffff', bottomColor: '#111827', accentColor: '#e2e8f0', description: 'Crisp white Senator attire with embroidery details.' },
  { id: 'm8', name: 'Apata Artisan Workwear', category: 'Male', style: 'Craft Worker', topColor: '#0284c7', bottomColor: '#0f172a', accentColor: '#0369a1', description: 'Durable blue denim jacket and utility trousers.' },
  { id: 'm9', name: 'Jericho Athletic Sportswear', category: 'Male', style: 'Sporty Activewear', topColor: '#dc2626', bottomColor: '#111827', accentColor: '#ef4444', description: 'Crimson athletic top with track pants.' },
  { id: 'm10', name: 'Mokola Cultural Buba', category: 'Male', style: 'Cultural Native', topColor: '#9333ea', bottomColor: '#581c87', accentColor: '#a855f7', description: 'Deep purple woven Buba & Sokoto.' }
];

export const FEMALE_OUTFITS: OutfitOption[] = [
  { id: 'f1', name: 'Ankara Peplum Blouse', category: 'Female', style: 'Traditional Chic', topColor: '#ec4899', bottomColor: '#be185d', accentColor: '#f472b6', description: 'Vibrant pink Ankara pattern blouse with matching skirt.' },
  { id: 'f2', name: 'Dugbe Modern Casual', category: 'Female', style: 'Blouse & Jeans', topColor: '#06b6d4', bottomColor: '#1e293b', accentColor: '#22d3ee', description: 'Cyan silk blouse paired with fitted denim.' },
  { id: 'f3', name: 'Bodija Market Seller Elegance', category: 'Female', style: 'Iro & Buba', topColor: '#f59e0b', bottomColor: '#78350f', accentColor: '#fbbf24', description: 'Warm amber traditional Iro and Buba wrapper.' },
  { id: 'f4', name: 'Corporate Banker Suit', category: 'Female', style: 'Formal Blazer', topColor: '#1e1b4b', bottomColor: '#1e1b4b', accentColor: '#6366f1', description: 'Tailored indigo blazer and trousers.' },
  { id: 'f5', name: 'Campus Student Casual', category: 'Female', style: 'T-Shirt & Skirt', topColor: '#10b981', bottomColor: '#064e3b', accentColor: '#34d399', description: 'Fresh mint green top with pleated dark skirt.' },
  { id: 'f6', name: 'Yoruba Royal Lace Attire', category: 'Female', style: 'Festive Lace', topColor: '#a855f7', bottomColor: '#6b21a8', accentColor: '#c084fc', description: 'Lavish royal purple lace blouse and wrapper.' },
  { id: 'f7', name: 'Jericho High-Fashion Dress', category: 'Female', style: 'Elegance Dress', topColor: '#e11d48', bottomColor: '#be123c', accentColor: '#fb7185', description: 'Ruby red formal evening dress.' },
  { id: 'f8', name: 'Sango Art Scholar Outfit', category: 'Female', style: 'Boho Chic', topColor: '#f97316', bottomColor: '#431407', accentColor: '#fb923c', description: 'Terracotta patterned tunic with trousers.' },
  { id: 'f9', name: 'Ring Road Executive', category: 'Female', style: 'Power Suit', topColor: '#334155', bottomColor: '#0f172a', accentColor: '#64748b', description: 'Charcoal corporate jacket and skirt.' },
  { id: 'f10', name: 'Active Fitness Wear', category: 'Female', style: 'Sporty Activewear', topColor: '#84cc16', bottomColor: '#1a2e05', accentColor: '#a3e635', description: 'Lime green workout top and athletic leggings.' }
];
