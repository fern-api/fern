import { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

import { getExtensionAndValidate } from "../../../getExtension";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "./fernExtensions";

export const XFernGroupsSchema: z.ZodRecord<
    z.ZodString,
    z.ZodObject<
        { summary: z.ZodOptional<z.ZodString>; description: z.ZodOptional<z.ZodString> },
        "strip",
        z.ZodTypeAny,
        { summary?: string | undefined; description?: string | undefined },
        { summary?: string | undefined; description?: string | undefined }
    >
> = z.record(
    z.string(),
    z.object({
        summary: z.string().optional(),
        description: z.string().optional()
    })
);
export type XFernGroupsSchema = z.infer<typeof XFernGroupsSchema>;

export function getFernGroups({
    document,
    context
}: {
    document: OpenAPIV3.Document;
    context: OpenAPIV3ParserContext;
}): XFernGroupsSchema | undefined {
    return getExtensionAndValidate<XFernGroupsSchema>(
        document,
        FernOpenAPIExtension.GROUPS,
        XFernGroupsSchema,
        context.logger
    );
}
