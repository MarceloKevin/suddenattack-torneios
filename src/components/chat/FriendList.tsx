import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import {
  ChatFriend,
  ChatMessage,
  MOCK_CHAT_SEED,
  MOCK_FRIENDS,
} from '../../data/mockFriends';
import { UserStatus } from '../../types';
import { cn } from '../../utils/cn';

const statusDotClass = (status: UserStatus) => {
  if (status === 'online') return 'bg-emerald-500';
  if (status === 'in-game') return 'bg-amber-400';
  return 'bg-transparent border-2 border-[#5a5f6b]';
};

const FriendAvatarButton: React.FC<{
  friend: ChatFriend;
  active?: boolean;
  onClick: () => void;
}> = ({ friend, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={friend.nickname}
    className={cn(
      'relative w-11 h-11 rounded-full overflow-hidden shrink-0 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/60',
      active ? 'ring-2 ring-[#E31B23]' : 'ring-1 ring-[#2a2e38]'
    )}
  >
    <img
      src={friend.avatar}
      alt={friend.nickname}
      className="w-full h-full object-cover"
    />
    <span
      className={cn(
        'absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#14161c]',
        statusDotClass(friend.status)
      )}
    />
  </button>
);

const ChatWindow: React.FC<{
  friend: ChatFriend;
  messages: ChatMessage[];
  onClose: () => void;
  onSend: (text: string) => void;
}> = ({ friend, messages, onClose, onSend }) => {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, friend.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="fixed right-[76px] bottom-4 z-50 w-[320px] sm:w-[360px] h-[440px] max-h-[70vh] flex flex-col border border-[#272B35] bg-[#0E1016] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#272B35] bg-[#13161D]">
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[#2a2e38]">
          <img src={friend.avatar} alt={friend.nickname} className="w-full h-full object-cover" />
          <span
            className={cn(
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#13161D]',
              statusDotClass(friend.status)
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{friend.nickname}</p>
          <p className="text-[10px] font-mono uppercase text-[#9298A5]">
            {friend.status === 'online'
              ? 'Online'
              : friend.status === 'in-game'
                ? 'Em partida'
                : 'Offline'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#9298A5] hover:text-white transition-colors"
          aria-label="Fechar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.length === 0 ? (
          <p className="text-[11px] font-mono text-zinc-600 text-center py-8">
            Nenhuma mensagem ainda. Diga oi!
          </p>
        ) : (
          messages.map((msg) => {
            const mine = msg.fromId === 'me';
            return (
              <div
                key={msg.id}
                className={cn('flex', mine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-3 py-2 text-xs leading-relaxed',
                    mine
                      ? 'bg-[#E31B23]/20 border border-[#E31B23]/40 text-white'
                      : 'bg-[#181B23] border border-[#272B35] text-zinc-200'
                  )}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[9px] font-mono text-[#9298A5] mt-1 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-[#272B35] p-2.5 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-[#181B23] border border-[#272B35] px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E31B23]"
        />
        <button
          type="submit"
          className="w-9 h-9 flex items-center justify-center bg-[#E31B23] text-white hover:bg-[#ff2a32] transition-colors disabled:opacity-40"
          disabled={!draft.trim()}
          aria-label="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export const FriendList: React.FC = () => {
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => ({
    ...MOCK_CHAT_SEED,
  }));

  const activeFriend = MOCK_FRIENDS.find((f) => f.id === activeFriendId) ?? null;

  const openChat = (friendId: string) => {
    setActiveFriendId((prev) => (prev === friendId ? null : friendId));
  };

  const sendMessage = (text: string) => {
    if (!activeFriendId) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromId: 'me',
      text,
      time,
    };
    setChats((prev) => ({
      ...prev,
      [activeFriendId]: [...(prev[activeFriendId] ?? []), message],
    }));
  };

  return (
    <>
      <aside
        className="friend-list hidden lg:flex fixed top-0 right-0 z-40 w-[68px] h-screen flex-col items-center gap-3 py-4 border-l border-[#1a1d24] bg-[#14161c] overflow-y-auto"
        aria-label="Lista de amigos"
      >
        <button
          type="button"
          onClick={() => setActiveFriendId(null)}
          className="w-11 h-11 rounded-full bg-[#1c1f28] border border-[#2a2e38] flex items-center justify-center text-white hover:border-[#E31B23]/60 transition-colors shrink-0"
          title="Conversas"
          aria-label="Conversas"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <div className="w-8 h-px bg-[#272B35] shrink-0" />

        <div className="flex flex-col items-center gap-3 pb-4">
          {MOCK_FRIENDS.map((friend) => (
            <FriendAvatarButton
              key={friend.id}
              friend={friend}
              active={activeFriendId === friend.id}
              onClick={() => openChat(friend.id)}
            />
          ))}
        </div>
      </aside>

      {activeFriend && (
        <ChatWindow
          friend={activeFriend}
          messages={chats[activeFriend.id] ?? []}
          onClose={() => setActiveFriendId(null)}
          onSend={sendMessage}
        />
      )}
    </>
  );
};
