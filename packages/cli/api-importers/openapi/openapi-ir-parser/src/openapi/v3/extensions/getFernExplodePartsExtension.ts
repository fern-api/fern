import { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

import { getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "./fernExtensions";

export const XFernExplodeParts = z.optional(z.boolean());
export type XFernExplodePartsSchema = z.infer<typeof XFernExplodeParts>;

export function getFernExplodePartsExtension(
    encoding: OpenAPIV3.EncodingObject,
    context: AbstractOpenAPIV3ParserContext
): boolean | undefined {
    const explodeParts = getExtensionAndValidate<XFernExplodePartsSchema>(
        encoding,
        FernOpenAPIExtension.EXPLODE_PARTS,
        XFernExplodeParts,
        context.logger
    );
    return explodeParts;
}
