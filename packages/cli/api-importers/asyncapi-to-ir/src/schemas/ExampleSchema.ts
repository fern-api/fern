import { z } from "zod";

export const WebsocketSessionExampleMessageSchema: z.ZodObject<
    { type: z.ZodString; channelId: z.ZodOptional<z.ZodString>; messageId: z.ZodString; value: z.ZodAny },
    "strip",
    z.ZodTypeAny,
    { type: string; messageId: string; value?: any; channelId?: string | undefined },
    { type: string; messageId: string; value?: any; channelId?: string | undefined }
> = z.object({
    type: z.string(),
    channelId: z.string().optional(),
    messageId: z.string(),
    value: z.any()
});

export const WebsocketSessionExtensionExampleSchema: z.ZodObject<
    {
        summary: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        "query-parameters": z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        messages: z.ZodArray<
            z.ZodObject<
                { type: z.ZodString; channelId: z.ZodOptional<z.ZodString>; messageId: z.ZodString; value: z.ZodAny },
                "strip",
                z.ZodTypeAny,
                { type: string; messageId: string; value?: any; channelId?: string | undefined },
                { type: string; messageId: string; value?: any; channelId?: string | undefined }
            >,
            "many"
        >;
    },
    "strip",
    z.ZodTypeAny,
    {
        messages: Array<{ type: string; messageId: string; value?: any; channelId?: string | undefined }>;
        headers?: Record<string, string> | undefined;
        summary?: string | undefined;
        description?: string | undefined;
        "query-parameters"?: Record<string, string> | undefined;
    },
    {
        messages: Array<{ type: string; messageId: string; value?: any; channelId?: string | undefined }>;
        headers?: Record<string, string> | undefined;
        summary?: string | undefined;
        description?: string | undefined;
        "query-parameters"?: Record<string, string> | undefined;
    }
> = z.object({
    summary: z.string().optional(),
    description: z.string().optional(),
    "query-parameters": z.record(z.string()).optional(),
    headers: z.record(z.string()).optional(),
    messages: z.array(WebsocketSessionExampleMessageSchema)
});

export const WebsocketSessionExtensionExamplesSchema: z.ZodArray<
    z.ZodObject<
        {
            summary: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            "query-parameters": z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            messages: z.ZodArray<
                z.ZodObject<
                    {
                        type: z.ZodString;
                        channelId: z.ZodOptional<z.ZodString>;
                        messageId: z.ZodString;
                        value: z.ZodAny;
                    },
                    "strip",
                    z.ZodTypeAny,
                    { type: string; messageId: string; value?: any; channelId?: string | undefined },
                    { type: string; messageId: string; value?: any; channelId?: string | undefined }
                >,
                "many"
            >;
        },
        "strip",
        z.ZodTypeAny,
        {
            messages: Array<{ type: string; messageId: string; value?: any; channelId?: string | undefined }>;
            headers?: Record<string, string> | undefined;
            summary?: string | undefined;
            description?: string | undefined;
            "query-parameters"?: Record<string, string> | undefined;
        },
        {
            messages: Array<{ type: string; messageId: string; value?: any; channelId?: string | undefined }>;
            headers?: Record<string, string> | undefined;
            summary?: string | undefined;
            description?: string | undefined;
            "query-parameters"?: Record<string, string> | undefined;
        }
    >,
    "many"
> = z.array(WebsocketSessionExtensionExampleSchema);
