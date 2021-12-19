import { decode } from "jsonwebtoken";

type Template<T> = {
  [Key in keyof T]: null;
}

type Result<T> = {
  [Key in keyof T]: T[Key]
};

export class TokenManager {
  static parseBearerToken(bearer_token: string): string {
    const [bearerPart, tokenPart] = bearer_token.split(" ");
    if (bearerPart !== "Bearer" || !tokenPart[1]) {
      throw Error("InvalidTokenException");
    }

    return tokenPart;
  }

  /**
   * decode without signature verification
   * @param token
   * @param template
   * @param mapper
   */
  static decode<T>(token: string, template: Template<T>, mapper?: Map<keyof T, string>): Result<T> {

    const result = { } as T;

    const payload = decode(token, { json: true });
    if (payload === null) {
      throw new Error("InvalidTokenException");
    }

    for (const key of Object.keys(template)) {
      const _key = key as keyof T;
      if (mapper) {
        const serverDataKey = mapper.get(_key);
        if (!serverDataKey) {
          throw Error("Unexpected empty server data key. Check Mapper or Server Data");
        }
        const value = payload[serverDataKey];
        if (!value) {
          throw Error("Unexpected empty server data value. Check Server Data");
        }
        result[_key] = value;
      } else {
        const value = payload[key];
        if (!value) {
          throw Error("Unexpected empty server data value. Check Server Data");
        }
        result[_key] = value;
      }
    }

    return result;
  }
}
