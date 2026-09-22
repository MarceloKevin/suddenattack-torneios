import { UserStatus } from '../types';

export interface ChatFriend {
  id: string;
  nickname: string;
  name: string;
  avatar: string;
  status: UserStatus;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  text: string;
  time: string;
}

export const MOCK_FRIENDS: ChatFriend[] = [
  {
    id: 'friend-1',
    nickname: 'SNIPER_VIPER',
    name: 'Gabriel Santos',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'online',
  },
  {
    id: 'friend-2',
    nickname: 'GHOST_BR',
    name: 'Lucas Rocha',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-3',
    nickname: 'RED_BULLET',
    name: 'Felipe Mendes',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-4',
    nickname: 'SHADOW_SA',
    name: 'Thiago Moura',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-5',
    nickname: 'FLASH_SK',
    name: 'Bruno Alves',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-6',
    nickname: 'CLUTCH_SK',
    name: 'Pedro Henrique',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-7',
    nickname: 'NOVA_SK',
    name: 'Rafael Souza',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-8',
    nickname: 'DRIFT_SK',
    name: 'Igor Campos',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
  {
    id: 'friend-9',
    nickname: 'PIXEL_SK',
    name: 'André Lima',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
  },
];

export const MOCK_CHAT_SEED: Record<string, ChatMessage[]> = {
  'friend-1': [
    {
      id: 'msg-1',
      fromId: 'friend-1',
      text: 'Bora treinar pra próxima? Crossport tá no pool.',
      time: '21:14',
    },
    {
      id: 'msg-2',
      fromId: 'me',
      text: 'Fechou. Te encontro no lobby em 10.',
      time: '21:16',
    },
  ],
  'friend-2': [
    {
      id: 'msg-3',
      fromId: 'friend-2',
      text: 'Vi o resultado do grupo. Massa demais.',
      time: '18:02',
    },
  ],
};
