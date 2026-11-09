-- Ejecutar en el SQL Editor de Supabase
-- Habilitar Realtime para los canales de mensajes y conversaciones
-- (desde Dashboard > Database > Realtime, activar las tablas: profiles, conversations, messages)

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Row Level Security: solo el dueño puede escribir su perfil, todos pueden leer
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  name text,
  is_group boolean default false,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Conversations viewable by participants"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

-- Función auxiliar para verificar membresía sin recursión de RLS
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and user_id = auth.uid()
  );
$$;

create policy "Participants viewable by members"
  on public.conversation_participants for select
  using (public.is_conversation_member(conversation_id));

create policy "Users can join conversations"
  on public.conversation_participants for insert
  with check (auth.uid() = user_id);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image','audio','gif','text')),
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Messages viewable by conversation participants"
  on public.messages for select
  using (public.is_conversation_member(conversation_id));

create policy "Participants can insert messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_conversation_member(conversation_id)
  );

-- Trigger: crear profile automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Política de INSERT para conversations (faltaba)
create policy "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = created_by);

-- RPC: crear conversación directa entre dos usuarios (evita RLS con security definer)
create or replace function public.create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  conv_id uuid;
begin
  -- Buscar conversación directa existente entre ambos
  select c.id into conv_id
  from public.conversations c
  join public.conversation_participants cp1
    on cp1.conversation_id = c.id and cp1.user_id = auth.uid()
  join public.conversation_participants cp2
    on cp2.conversation_id = c.id and cp2.user_id = other_user_id
  where c.is_group = false
  limit 1;

  if conv_id is not null then
    return conv_id;
  end if;

  -- Crear la conversación
  insert into public.conversations (name, is_group, created_by)
  values (null, false, auth.uid())
  returning id into conv_id;

  -- Insertar ambos participantes
  insert into public.conversation_participants (conversation_id, user_id) values
    (conv_id, auth.uid()),
    (conv_id, other_user_id);

  return conv_id;
end;
$$;

grant execute on function public.create_direct_conversation(uuid) to authenticated;

-- Storage buckets para medios (crear desde Dashboard > Storage):
--   chat-media (público, para imágenes/audio/gifs)
--   profile-avatars (público, para avatares)

-- Eliminar una conversación de la lista: cada usuario borra su propia participación
drop policy if exists "Users can leave conversations" on public.conversation_participants;
create policy "Users can leave conversations"
  on public.conversation_participants for delete
  using (auth.uid() = user_id);
