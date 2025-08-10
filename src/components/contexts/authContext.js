import { createContext } from 'react';
import { AUTH_INITIAL_STATE } from './authConstants';

export const AuthContext = createContext(AUTH_INITIAL_STATE);
