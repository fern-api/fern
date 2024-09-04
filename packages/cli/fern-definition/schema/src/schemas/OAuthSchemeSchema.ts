import { z } from "zod";
import { OAuthClientCredentialsSchema } from "./OAuthClientCredentialsSchema";

export const OAuthSchemeSchema = OAuthClientCredentialsSchema;

export type OAuthSchemeSchema = z.infer<typeof OAuthSchemeSchema>;
