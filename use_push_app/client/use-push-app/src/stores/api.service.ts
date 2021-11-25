import {AuthStore} from "./auth-store";
import {Store} from "./store";
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

class Api extends Store {

  public_paths = [
    '/',
    '/sign_in',
    '/sign_up',
    '/api/auth/sign_in',
    '/api/auth/sign_up',
    '/api/auth/refresh_tokens',
    '/sandbox'
  ]

  async call<T>(endpoint: string, requestInit: RequestInit = Object.create(RequestInitClass)): Promise<ApiResponse<T>> {
    const headers = new Headers();

    // JSON Api
    headers.append('Content-Type', 'application/json');

    // <empty_string> == Browser_Environment
    headers.append('X-UUID', '');

    if (!this.public_paths.includes(endpoint)) {
      headers.append('Authorization', AuthStore.getStore().accessToken ?? "");
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
          console.log(result);
          return result;
        case "fail":
          ErrorStore.getStore().errorsSubject.next({data, message});
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

const api = Api.getStore();

export {
  api
};

