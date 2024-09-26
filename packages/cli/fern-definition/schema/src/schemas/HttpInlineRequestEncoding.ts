import { z } from "zod";

export const HttpInlineRequestEncoding = z.enum([
    "json",
    "multipart",
    "url"
    // TODO(dsinghvi): should we add proto here?
]);

export type HttpInlineRequestEncoding = z.infer<typeof HttpInlineRequestEncoding>;
