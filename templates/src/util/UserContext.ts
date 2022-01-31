import React from 'react';
import { getStorage } from './storage';

export interface IContext {
  id?: string;
  joined?: string;
  role?: string;
  settings?: {
    theme?: string;
    language?: string;
  };
  token?: string;
  translations?: {
    [key: string]: {
      [key: string]: string;
    };
  };
  address?: string;
}

export function getDefaultUserContext() {
  return {
    id: '',
    joined: '',
    role: '',
    settings: {
      theme: getStorage('theme') || 'light',
      language: getStorage('language') || 'english'
    },
    token: getStorage('token') || '',
    translations: {},
    address: getStorage('address') || ''
  }
}

const UserContext = React.createContext<IContext>(getDefaultUserContext());

export default UserContext;
