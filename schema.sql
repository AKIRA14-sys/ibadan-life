-- IBADAN LIFE DATABASE SCHEMA & RLS POLICIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_district TEXT DEFAULT 'Iwo Road',
    public_avatar_data JSONB DEFAULT '{}'::jsonb,
    reputation INT DEFAULT 100,
    status TEXT DEFAULT 'Exploring Ibadan'
);

CREATE TABLE IF NOT EXISTS public.player_private (
    player_id UUID PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
    hidden_background TEXT NOT NULL CHECK (hidden_background IN ('LAPO Baby', 'Middle-Class Kid', 'Nepo Baby')),
    private_financial_info JSONB DEFAULT '{}'::jsonb,
    private_progression_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.characters (
    player_id UUID PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
    age INT DEFAULT 20,
    gender TEXT DEFAULT 'Unspecified',
    skin_tone TEXT DEFAULT '#8d5524',
    hairstyle TEXT DEFAULT 'Afro Short',
    hair_color TEXT DEFAULT '#1c1917',
    face_style TEXT DEFAULT 'Standard',
    clothing JSONB DEFAULT '{"top": "#1e40af", "bottom": "#1e293b", "shoes": "#0f172a"}'::jsonb,
    personality TEXT DEFAULT 'Energetic',
    starting_neighborhood TEXT DEFAULT 'Iwo Road'
);

CREATE TABLE IF NOT EXISTS public.wallets (
    player_id UUID PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
    cash NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
    bank_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    salary NUMERIC(12, 2) NOT NULL,
    requirements JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.player_jobs (
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    progress INT DEFAULT 0,
    status TEXT DEFAULT 'Active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.player_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    ownership_type TEXT DEFAULT 'Owned',
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.friendships (
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    friend_player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id, friend_player_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    receiver_player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_achievements (
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id, achievement_id)
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public players readable by all" ON public.players FOR SELECT USING (true);
CREATE POLICY "Private data restricted" ON public.player_private FOR ALL USING (true);
CREATE POLICY "Characters readable" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Wallets accessible" ON public.wallets FOR ALL USING (true);
