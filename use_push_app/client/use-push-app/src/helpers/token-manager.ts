export class TokenManager {
  static parseBearerToken(bearer_token: string): string {
    const [bearerPart, tokenPart] = bearer_token.split(" ");
    if (bearerPart !== "Bearer" || !tokenPart[1]) {
      throw Error("InvalidTokenException");
    }

    return tokenPart;
  }
}