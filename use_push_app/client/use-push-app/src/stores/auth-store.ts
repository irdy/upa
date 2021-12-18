import { getStore } from "./store";
import { api, ApiResponse } from "./api.service";
import { TokenManager } from "../helpers/token-manager";

export interface AuthResponseData {
  access_token: string;
  refresh_token?: string; // mobile only
}

interface InvitationLink {
  link_uuid: string;
}

type AuthStoreSubjectNames = "tokenPair";

const Store = getStore<AuthStoreSubjectNames>();

export class AuthStore extends Store {

  @Store.withSubject<AuthResponseData | null>("tokenPair")
  setTokenPair(authData: AuthResponseData | null): AuthResponseData | null {
    if (!authData) return null;

    authData.access_token = TokenManager.parseBearerToken(authData.access_token);
    if (authData.refresh_token) {
      authData.refresh_token = TokenManager.parseBearerToken(authData.refresh_token);
    }

    return authData;
  }

  async refreshTokens(): Promise<ApiResponse<AuthResponseData>> {
    // POST-request
    const result = await api.call<AuthResponseData>('/api/auth/refresh_tokens');
    this.setTokenPair(result.data);

    return result;
  }

  async signIn(requestInit: RequestInit): Promise<ApiResponse<AuthResponseData>> {
    const result = await api.call<AuthResponseData>('/api/auth/sign_in', requestInit);
    this.setTokenPair(result.data);

    return result;
  }

  async signUp(requestInit: RequestInit): Promise<ApiResponse<AuthResponseData>> {
    const result = await api.call<AuthResponseData>('/api/auth/sign_up', requestInit);
    this.setTokenPair(result.data);

    return result;
  }

  generateInvitationLink() {
    return api.call<InvitationLink>('/api/auth/invitation_link');
  }

  async signOut(): Promise<ApiResponse<AuthResponseData>> {
    const result = await api.call<AuthResponseData>('/api/auth/sign_out');
    this.setTokenPair(result.data);

    return result;
  }
}

