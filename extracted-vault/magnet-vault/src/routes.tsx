import Home from './pages/Home';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Magnet Vault',
    path: '/',
    element: <Home />,
    public: true,
  },
];
