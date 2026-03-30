import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Bookmark, MessageCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Room {
  id: string;
  name: string;
  subject: string | null;
  last_message?: string;
  last_message_time?: string;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_saved?: boolean;
}

// Chat Room List
const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadRooms = async () => {
      const { data } = await supabase
        .from('chat_participants')
        .select('room_id, chat_rooms(id, name, subject, created_at)')
        .eq('user_id', user.id);
      if (data) {
        const roomList: Room[] = data
          .filter((d) => d.chat_rooms)
          .map((d) => {
            const room = d.chat_rooms as any;
            return { id: room.id, name: room.name, subject: room.subject };
          });
        setRooms(roomList);
      }
    };
    loadRooms();
  }, [user]);

  const handleCreateRoom = async () => {
    if (!user || !newRoomName.trim()) return;
    const { data: room } = await supabase.from('chat_rooms').insert({ name: newRoomName.trim(), created_by: user.id }).select().single();
    if (room) {
      await supabase.from('chat_participants').insert({ room_id: room.id, user_id: user.id });
      setRooms((prev) => [...prev, { id: room.id, name: room.name, subject: room.subject }]);
      setCreateOpen(false);
      setNewRoomName('');
      navigate(`/chat/${room.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top flex items-center justify-between bg-card px-5 pb-4 pt-4 shadow-sm">
        <h1 className="text-xl font-bold">메시지</h1>
        <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> 새 채팅
        </Button>
      </div>
      <div className="space-y-1 px-4 pt-3">
        {rooms.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">채팅방이 없어요. 새 채팅을 시작해 보세요!</p>}
        {rooms.map((room) => (
          <Card key={room.id} className="cursor-pointer border-none shadow-sm transition-colors hover:bg-secondary/50" onClick={() => navigate(`/chat/${room.id}`)}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-sm">{room.name}</span>
                {room.subject && <p className="text-xs text-muted-foreground">{room.subject}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/chat/archive')}>
          <Bookmark className="mr-2 h-4 w-4" /> 저장된 메시지
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>새 채팅방 만들기</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="채팅방 이름" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
            <Button className="w-full" onClick={handleCreateRoom} disabled={!newRoomName.trim()}>만들기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Chat Room View with Realtime
const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [roomName, setRoomName] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load room info
  useEffect(() => {
    if (!roomId) return;
    supabase.from('chat_rooms').select('name').eq('id', roomId).maybeSingle().then(({ data }) => {
      if (data) setRoomName(data.name);
    });
  }, [roomId]);

  // Load messages
  useEffect(() => {
    if (!roomId || !user) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*, profiles:sender_id(display_name)')
        .eq('room_id', roomId)
        .order('created_at');
      if (data) {
        setMessages(data.map((m) => ({
          id: m.id,
          room_id: m.room_id,
          sender_id: m.sender_id,
          sender_name: (m.profiles as any)?.display_name || '알 수 없음',
          content: m.content,
          created_at: m.created_at,
        })));
      }
      // Load saved messages
      const { data: saved } = await supabase
        .from('saved_messages')
        .select('message_id')
        .eq('user_id', user.id);
      if (saved) setSavedIds(new Set(saved.map((s) => s.message_id)));
    };
    loadMessages();
  }, [roomId, user]);

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, async (payload) => {
        const msg = payload.new as any;
        // Fetch sender name
        const { data: senderProfile } = await supabase.from('profiles').select('display_name').eq('user_id', msg.sender_id).maybeSingle();
        const newMsg: Message = {
          id: msg.id,
          room_id: msg.room_id,
          sender_id: msg.sender_id,
          sender_name: senderProfile?.display_name || '알 수 없음',
          content: msg.content,
          created_at: msg.created_at,
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !roomId) return;
    await supabase.from('chat_messages').insert({ room_id: roomId, sender_id: user.id, content: input.trim() });
    setInput('');
  };

  const toggleSave = async (msgId: string) => {
    if (!user) return;
    if (savedIds.has(msgId)) {
      await supabase.from('saved_messages').delete().eq('user_id', user.id).eq('message_id', msgId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(msgId); return n; });
    } else {
      await supabase.from('saved_messages').insert({ user_id: user.id, message_id: msgId });
      setSavedIds((prev) => new Set(prev).add(msgId));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="safe-top sticky top-0 z-10 flex items-center gap-3 bg-card px-4 pb-3 pt-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="font-semibold">{roomName}</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-28">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const isSaved = savedIds.has(msg.id);
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`group max-w-[80%]`}>
                {!isMe && <p className="mb-1 text-xs font-medium text-muted-foreground">{msg.sender_name}</p>}
                <div className={`relative rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-card shadow-sm'}`}>
                  {msg.content}
                  <button onClick={() => toggleSave(msg.id)} className={`absolute -bottom-1 ${isMe ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {format(new Date(msg.created_at), 'HH:mm')}
                  {isSaved && <span className="ml-1">• 저장됨</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card px-4 py-3 safe-bottom">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <Input placeholder="메시지를 입력하세요..." value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" />
          <Button size="icon" type="submit" disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
};

// Archive
const ChatArchive = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedMessages, setSavedMessages] = useState<(Message & { room_name?: string })[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('saved_messages')
        .select('message_id, chat_messages(id, room_id, sender_id, content, created_at, chat_rooms(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        const msgs = data
          .filter((d) => d.chat_messages)
          .map((d) => {
            const m = d.chat_messages as any;
            return {
              id: m.id,
              room_id: m.room_id,
              sender_id: m.sender_id,
              sender_name: '',
              content: m.content,
              created_at: m.created_at,
              room_name: m.chat_rooms?.name,
            };
          });
        setSavedMessages(msgs);
      }
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top sticky top-0 z-10 flex items-center gap-3 bg-card px-4 pb-3 pt-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="font-semibold">저장된 메시지</h2>
      </div>
      <div className="space-y-2 px-4 pt-3">
        {savedMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">저장된 메시지가 없어요.</p>
        ) : (
          savedMessages.map((msg) => (
            <Card key={msg.id} className="cursor-pointer border-none shadow-sm" onClick={() => navigate(`/chat/${msg.room_id}`)}>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-primary">{msg.room_name || '채팅방'}</p>
                <p className="text-sm">{msg.content}</p>
                <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), 'M월 d일 HH:mm')}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const { roomId } = useParams();
  if (roomId === 'archive') return <ChatArchive />;
  if (roomId) return <ChatRoom />;
  return <ChatList />;
};

export default Chat;
