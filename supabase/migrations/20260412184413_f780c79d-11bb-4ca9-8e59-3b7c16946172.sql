
-- Drop foreign key on profiles so we can seed demo data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Also check and drop any FK on comments, reactions, etc. that reference auth.users
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_created_by_fkey;
ALTER TABLE public.room_members DROP CONSTRAINT IF EXISTS room_members_user_id_fkey;
ALTER TABLE public.room_messages DROP CONSTRAINT IF EXISTS room_messages_user_id_fkey;
ALTER TABLE public.saved_posts DROP CONSTRAINT IF EXISTS saved_posts_user_id_fkey;
ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_user_id_fkey;
ALTER TABLE public.direct_thread_members DROP CONSTRAINT IF EXISTS direct_thread_members_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
