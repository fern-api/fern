import { z } from "zod";

export const OAuthRefreshTokenPropertiesSchema = z.strictObject({
    "refresh-token": z.string()
});

export type OAuthRefreshTokenPropertiesSchema = z.infer<typeof OAuthRefreshTokenPropertiesSchema>;
