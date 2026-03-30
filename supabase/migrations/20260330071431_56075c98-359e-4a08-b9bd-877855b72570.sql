
-- Fix overly permissive chat_participants INSERT policy
DROP POLICY "Room creator can add participants" ON public.chat_participants;

-- Only room creator or existing participants can add new participants
CREATE POLICY "Room members can add participants" ON public.chat_participants FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.room_id = chat_participants.room_id AND cp.user_id = auth.uid())
  );
