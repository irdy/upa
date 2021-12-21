import { AuthResponseData, AuthStore } from "./auth-store";
import { getStore } from "./store";
import { ErrorStore } from "./error.store";

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error',
  data: T | null,
  message: string | null,
}

class RequestInitClass implements RequestInit {
}

function getServerHost() {
  if (process.env.REACT_APP_HOST) {
      return process.env.REACT_APP_HOST;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://use-push.herokuapp.com"
  }

  return process.env.REACT_APP_HOST;
}

const SERVER_HOST = getServerHost();

const Store = getStore();

const ExpiredSignatureError = "ExpiredSignatureError";

class Api extends Store {

  public_paths = [
    '/api/auth/sign_in',
    '/api/auth/sign_up',
    '/api/auth/refresh_tokens',
  ]

  static addAccessTokenToHeaders(headers: Headers) {
    const tokenPair = AuthStore.getInstance().getSubject<AuthResponseData>("tokenPair").getValue();
    const accessToken = "Bearer " + tokenPair.access_token ?? "";
    headers.set('Authorization', accessToken);
  }

  async call<T>(endpoint: string, requestInit: RequestInit = Object.create(RequestInitClass)): Promise<ApiResponse<T>> {
    const headers = new Headers();

    // JSON Api
    headers.append('Content-Type', 'application/json');

    // <empty_string> == Browser_Environment
    headers.append('X-UUID', '');

    if (!this.public_paths.includes(endpoint)) {
      Api.addAccessTokenToHeaders(headers);
    }

    const _requestInit: RequestInit = {
      method: 'POST', // default POST
      ...requestInit,
      headers: headers,
      credentials: "include"
    };

    const request = new Request(SERVER_HOST + endpoint, _requestInit);

    try {
      const res = await fetch(request);
      const result: ApiResponse<T> = await res.json();

      const { status, data, message } = result;

      switch (status) {
        case "success":
          return result;
        case "fail":
          // if server return `token expired`, then:
          // 1) make request "refreshTokens"
          // 2) repeat failed request with expired token with new token received on step 1)
          if (message === ExpiredSignatureError) {
            const prevRequest = request;
            await AuthStore.getInstance().refreshTokens(); // todo try again logic?
            Api.addAccessTokenToHeaders(prevRequest.headers);
            await fetch(prevRequest);
          } else {
            ErrorStore.emitError({data, message});
          }
          return result;
        case "error":
          return Promise.reject(Error("Error: " + message ?? "Unknown Server Error"))
        default:
          return Promise.reject(Error("Unexpected Response Status..."))
      }
    } catch (err) {
      throw err;
    }
  }
}

const api = Api.getInstance();

export {
  api
};

