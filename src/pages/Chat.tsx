import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockChatRooms, mockMessages, mockUser, type ChatMessage } from '@/lib/mockData';
import { ArrowLeft, Send, Bookmark, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const ChatList = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-card px-5 pb-4 pt-4 shadow-sm">
        <h1 className="text-xl font-bold">메시지</h1>
      </div>
      <div className="space-y-1 px-4 pt-3">
        {mockChatRooms.map((room) => (
          <Card key={room.id} className="cursor-pointer border-none shadow-sm transition-colors hover:bg-secondary/50" onClick={() => navigate(`/chat/${room.id}`)}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{room.name}</span>
                  {room.lastMessageTime && <span className="text-xs text-muted-foreground">{format(new Date(room.lastMessageTime), 'HH:mm')}</span>}
                </div>
                {room.lastMessage && <p className="truncate text-xs text-muted-foreground">{room.lastMessage}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/chat/archive')}>
          <Bookmark className="mr-2 h-4 w-4" /> 저장된 메시지
        </Button>
      </div>
    </div>
  );
};

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages[roomId!] || []);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const room = mockChatRooms.find((r) => r.id === roomId);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: `msg-${Date.now()}`, roomId: roomId!, senderId: mockUser.id, senderName: mockUser.name, senderRole: mockUser.role, content: input, timestamp: new Date().toISOString(),
    }]);
    setInput('');
  };

  const toggleSave = (msgId: string) => {
    setMessages(messages.map((m) => (m.id === msgId ? { ...m, saved: !m.saved } : m)));
  };

  if (!room) return <div className="p-4">채팅방을 찾을 수 없어요</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="safe-top sticky top-0 z-10 flex items-center gap-3 bg-card px-4 pb-3 pt-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="font-semibold">{room.name}</h2>
          {room.subject && <p className="text-xs text-muted-foreground">{room.subject}</p>}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-28">
        {messages.map((msg) => {
          const isMe = msg.senderId === mockUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`group max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <p className="mb-1 text-xs font-medium text-muted-foreground">{msg.senderName}</p>}
                <div className={`relative rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-card shadow-sm'}`}>
                  {msg.content}
                  <button onClick={() => toggleSave(msg.id)} className={`absolute -bottom-1 ${isMe ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Bookmark className={`h-4 w-4 ${msg.saved ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {format(new Date(msg.timestamp), 'HH:mm')}
                  {msg.saved && <span className="ml-1">• 저장됨</span>}
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

const ChatArchive = () => {
  const navigate = useNavigate();
  const allSaved = Object.values(mockMessages).flat().filter((m) => m.saved);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top sticky top-0 z-10 flex items-center gap-3 bg-card px-4 pb-3 pt-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="font-semibold">저장된 메시지</h2>
      </div>
      <div className="space-y-2 px-4 pt-3">
        {allSaved.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">저장된 메시지가 없어요. 메시지를 길게 누르거나 마우스를 올려서 저장해 보세요.</p>
        ) : (
          allSaved.map((msg) => (
            <Card key={msg.id} className="cursor-pointer border-none shadow-sm" onClick={() => navigate(`/chat/${msg.roomId}`)}>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-primary">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{format(new Date(msg.timestamp), 'M월 d일 HH:mm')}</span>
                  {msg.labels?.map((l) => <span key={l} className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{l}</span>)}
                </div>
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
