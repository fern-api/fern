import type { AuthRequest } from "./AuthRequest.js";

export interface AuthProvider {
  getAuthRequest(): Promise<AuthRequest>;
}
