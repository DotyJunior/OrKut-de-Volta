import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

// In-memory access token cache (never stored in localStorage/sessionStorage for security)
let cachedAccessToken: string | null = null;

// Track if connection/auth is in progress
let isConnecting = false;

// Request Google Meet creation scope specifically
const MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.created';

/**
 * Initiates Google OAuth popup and requests permission for Google Meet
 */
export const connectGoogleMeet = async (): Promise<string> => {
  if (isConnecting) {
    throw new Error('Conexão com o Google já está em andamento.');
  }

  try {
    isConnecting = true;
    const provider = new GoogleAuthProvider();
    provider.addScope(MEET_SCOPE);
    
    // Prompt Google sign-in/consent popup
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential || !credential.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error: any) {
    console.error('Google OAuth connecting error:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

/**
 * Gets currently cached token
 */
export const getMeetAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Clear connection / Auth token
 */
export const disconnectGoogleMeet = () => {
  cachedAccessToken = null;
};

/**
 * Google Meet API Space creation response interface
 */
export interface GoogleMeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
}

/**
 * Creates a unique Google Meet Meeting Space using Google Meet REST API
 * @param token Custom OAuth access token (or falls back to memory cache)
 */
export const createGoogleMeeting = async (token?: string): Promise<GoogleMeetSpace> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Autenticação do Google Meet requirida. Conecte-se primeiro.');
  }

  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Failed to create Meet space:', errText);
    throw new Error(`Erro na API do Google Meet: ${response.statusText || 'Falha na requisição'}`);
  }

  const data = await response.json();
  if (!data.meetingUri) {
    throw new Error('A API do Google Meet não retornou um link de reunião válido.');
  }

  return {
    name: data.name || '',
    meetingUri: data.meetingUri,
    meetingCode: data.meetingCode || ''
  };
};
