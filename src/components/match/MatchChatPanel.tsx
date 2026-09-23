import React, { useEffect, useRef, useState } from 'react';
import { BellRing, MessagesSquare, Send, ShieldAlert } from 'lucide-react';
import { MatchChatMessage, User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface MatchChatPanelProps {
  messages: MatchChatMessage[];
  currentUser: User | null;
  adminCalled?: boolean;
  adminCalledAt?: string;
  adminCalledBy?: string;
  onSend: (text: string) => { ok: boolean; message?: string };
  onCallAdmin: () => { ok: boolean; message?: string };
}

export const MatchChatPanel: React.FC<MatchChatPanelProps> = ({
  messages,
  currentUser,
  adminCalled,
  adminCalledAt,
  adminCalledBy,
  onSend,
  onCallAdmin,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [callFeedback, setCallFeedback] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Faça login para participar do chat.');
      return;
    }
    const result = onSend(text);
    if (!result.ok) {
      setError(result.message || 'Não foi possível enviar.');
      return;
    }
    setText('');
    setError('');
  };

  const handleCallAdmin = () => {
    if (!currentUser) {
      setError('Faça login para chamar um admin.');
      return;
    }
    const result = onCallAdmin();
    if (!result.ok) {
      setError(result.message || 'Não foi possível chamar o admin.');
      setCallFeedback('');
      return;
    }
    setError('');
    setCallFeedback(result.message || 'Admin alertado.');
  };

  return (
    <section className="sa-ms-chat" aria-label="Chat da partida">
      <header className="sa-ms-chat__head">
        <div className="sa-ms-chat__head-main">
          <div className="sa-ms-chat__title-wrap">
            <MessagesSquare className="sa-ms-chat__icon" aria-hidden />
            <div>
              <h2 className="sa-ms-chat__title">CHAT DA PARTIDA</h2>
              <p className="sa-ms-chat__subtitle">
                Canal da partida para jogadores e administradores alinharem
                veto, servidor e resultado.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`sa-ms-chat__call ${adminCalled ? 'is-called' : ''}`}
            disabled={Boolean(adminCalled) || !currentUser}
            onClick={handleCallAdmin}
          >
            <BellRing className="w-4 h-4" aria-hidden />
            {adminCalled ? 'ADMIN CHAMADO' : 'CHAMAR ADMIN'}
          </button>
        </div>
      </header>

      {adminCalled && (
        <div className="sa-ms-chat__alert" role="status">
          <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden />
          <span>
            Admin chamado
            {adminCalledBy ? ` por ${adminCalledBy}` : ''}
            {adminCalledAt ? ` · ${adminCalledAt}` : ''}. Aguardando atenção.
          </span>
        </div>
      )}

      {callFeedback && !adminCalled && (
        <p className="sa-ms-chat__feedback">{callFeedback}</p>
      )}

      <div className="sa-ms-chat__list" ref={listRef}>
        {messages.length === 0 ? (
          <p className="sa-ms-chat__empty">
            Nenhuma mensagem ainda. Seja o primeiro a falar sobre a partida.
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = currentUser?.id === msg.userId;
            if (msg.system) {
              return (
                <div key={msg.id} className="sa-ms-chat__system">
                  <span>{msg.text}</span>
                  <time>{msg.sentAt}</time>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`sa-ms-chat__msg ${isOwn ? 'is-own' : ''}`}
              >
                <div className="sa-ms-chat__avatar">
                  <Avatar src={msg.avatar} name={msg.nickname} size="sm" />
                </div>
                <div className="sa-ms-chat__content">
                  <div className="sa-ms-chat__meta">
                    <span className="sa-ms-chat__nick">
                      {msg.nickname}
                      {msg.isAdmin && (
                        <span className="sa-ms-chat__admin">ADMIN</span>
                      )}
                    </span>
                    <time>{msg.sentAt}</time>
                  </div>
                  <p className="sa-ms-chat__text">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form className="sa-ms-chat__form" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            currentUser
              ? 'Escreva uma mensagem sobre a partida...'
              : 'Faça login para enviar mensagens'
          }
          disabled={!currentUser}
          className="sa-ms-chat__input"
          maxLength={500}
        />
        <button
          type="submit"
          className="sa-ms-chat__send"
          disabled={!currentUser || !text.trim()}
        >
          <Send className="w-4 h-4" aria-hidden />
          ENVIAR
        </button>
      </form>

      {error && <p className="sa-ms-chat__error">{error}</p>}
    </section>
  );
};
