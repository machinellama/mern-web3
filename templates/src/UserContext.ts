import React from 'react';

export interface IContext {
  language: string;
  theme: string;
  translations: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

const UserContext = React.createContext<IContext>({
  language: 'english',
  theme: 'light',
  translations: {}
});

export default UserContext;
