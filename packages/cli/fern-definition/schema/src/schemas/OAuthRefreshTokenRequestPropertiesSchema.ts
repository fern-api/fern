import { z } from "zod";

export const OAuthRefreshTokenRequestPropertiesSchema = z.strictObject({
    "refresh-token": z.string().describe("The property name for the refresh token.")
});

export type OAuthRefreshTokenRequestPropertiesSchema = z.infer<typeof OAuthRefreshTokenRequestPropertiesSchema>;
