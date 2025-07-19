import z from "zod";

import { Logger } from "@fern-api/logger";

import { getExtensionAndValidate } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export type TypeName = {
    value: string;
    casing?: {
        camel?: string;
        pascal?: string;
        snake?: string;
        "screaming-snake"?: string;
    };
};

export function getFernTypeNameExtension(key: string, object: object, logger: Logger): TypeName {
    const nameOverride = getExtensionAndValidate<string | {
        value?: string;
        casing?: {
            camel?: string;
            pascal?: string;
            snake?: string;
            "screaming-snake"?: string;
        };
    }>(
        object,
        FernOpenAPIExtension.TYPE_NAME,
        z.optional(
            z.union([
                z.string(),
                z.object({
                    value: z.optional(z.string()),
                    casing: z.optional(
                        z.object({
                            camel: z.string().optional(),
                            pascal: z.string().optional(),
                            snake: z.string().optional(),
                            "screaming-snake": z.string().optional()
                        })
                    )
                })
            ])
        ),
        logger
    );
    if(nameOverride == null) {
        return {
            value: key,
        };
    }
    if (typeof nameOverride === "string") {
        return {
            value: nameOverride
        };
    }
    return {
        value: nameOverride.value ?? key,
        casing: nameOverride.casing
    };
}
