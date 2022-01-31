export interface User {
  id?: string;
  joined: string;
  password?: string;
  role: string;
  settings: {
    theme: string;
    language: string;
  };
  token?: string;
  address?: string;
  nonce?: number;
}
