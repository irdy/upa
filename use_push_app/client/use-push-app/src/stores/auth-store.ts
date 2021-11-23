import { Store } from "./store";
import { api } from "./api.service";

interface AuthResponseData {
  access_token: string;
  refresh_token?: string; // mobile only
}

export class AuthStore extends Store {
  accessToken: string | null = null;

  refreshTokens() {
    return api.call<AuthResponseData>('/api/auth/refresh_tokens');
  }

  signIn(requestInit: RequestInit) {
    return api.call<AuthResponseData>('/api/auth/sign_in', requestInit);
  }

  signUp(requestInit: RequestInit) {
    return api.call<AuthResponseData>('/api/auth/sign_up', requestInit);
  }

  setAccessToken(authData: AuthResponseData | null) {
    if (authData?.access_token) {
      this.accessToken = authData.access_token;
    } else {
      throw new Error("No Access Token!");
    }
  }
}

