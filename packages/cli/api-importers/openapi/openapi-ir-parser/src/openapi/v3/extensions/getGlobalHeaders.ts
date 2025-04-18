import { OpenAPIV3 } from "openapi-types";

import { GlobalHeader } from "@fern-api/openapi-ir";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getSchemaFromFernType } from "./getFernTypeExtension";

interface GlobalHeaderExtension {
    header: string;
    name: string | undefined;
    optional: boolean | undefined;
    env: string | undefined;
    type: string | undefined;
}

export function getGlobalHeaders(document: OpenAPIV3.Document): GlobalHeader[] {
    const globalHeaders = getExtension<GlobalHeaderExtension[]>(document, FernOpenAPIExtension.FERN_GLOBAL_HEADERS);
    const result: GlobalHeader[] = [];
    for (const header of globalHeaders ?? []) {
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
                          groupName: undefined,
                          nameOverride: undefined
                      })
                    : undefined
        });
    }
    return result;
}
