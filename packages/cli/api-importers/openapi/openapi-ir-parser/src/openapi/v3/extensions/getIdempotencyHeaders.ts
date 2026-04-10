import { IdempotencyHeader } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";
import { getSchemaFromFernType } from "./getFernTypeExtension.js";

interface IdempotencyHeaderExtension {
    header: string;
    name: string | undefined;
    env: string | undefined;
    type: string | undefined;
}

export function getIdempotencyHeaders(document: OpenAPIV3.Document): IdempotencyHeader[] {
    const idempotencyHeaders = getExtension<IdempotencyHeaderExtension[]>(
        document,
        FernOpenAPIExtension.FERN_IDEMPOTENCY_HEADERS
    );
    const result: IdempotencyHeader[] = [];
    for (const header of idempotencyHeaders ?? []) {
        result.push({
            ...header,
            schema:
                header.type != null
                    ? getSchemaFromFernType({
                          fernType: header.type,
                          description: undefined,
                          availability: undefined,
                          generatedName: header.name ?? header.header,
                          title: undefined,
                          namespace: undefined,
                          groupName: undefined,
                          nameOverride: undefined
                      })
                    : undefined
        });
    }
    return result;
}
