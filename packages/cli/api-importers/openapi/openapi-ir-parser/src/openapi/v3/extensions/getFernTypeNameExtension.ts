import z from "zod";

import { Logger } from "@fern-api/logger";

import { getExtensionAndValidate } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export type OverrideTypeName = {
    value: string | undefined;
    casing:
        | {
              camel: string | undefined;
              pascal: string | undefined;
              snake: string | undefined;
              screamingSnake: string | undefined;
          }
        | undefined;
};

export function getFernTypeNameExtension(
    object: object,
    fallback: string | undefined,
    logger: Logger
): OverrideTypeName | undefined {
    const nameOverride = getExtensionAndValidate<
        | string
        | {
              value?: string;
              casing?: {
                  camel?: string;
                  pascal?: string;
                  snake?: string;
                  "screaming-snake"?: string;
              };
          }
    >(
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
    if (nameOverride == null) {
        return {
            value: fallback,
            casing: undefined
        };
    }
    if (typeof nameOverride === "string") {
        return {
            value: nameOverride,
            casing: undefined
        };
    }
    return {
        value: nameOverride.value ?? fallback,
        casing: {
            camel: nameOverride.casing?.camel,
            pascal: nameOverride.casing?.pascal,
            snake: nameOverride.casing?.snake,
            screamingSnake: nameOverride.casing?.["screaming-snake"]
        }
    };
}
