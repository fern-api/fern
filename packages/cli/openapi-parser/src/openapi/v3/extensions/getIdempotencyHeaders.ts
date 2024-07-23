import { FernOpenapiIr, IdempotencyHeader } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { convertSchemaWithExampleToSchema } from "../../../schema/utils/convertSchemaWithExampleToSchema";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getSchemaFromFernType } from "./getFernTypeExtension";

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
        let schema: FernOpenapiIr.Schema | undefined = undefined;
        if (header.type != null) {
            const schemaWithExample = getSchemaFromFernType({
                fernType: header.type,
                description: undefined,
                availability: undefined,
                generatedName: header.name ?? header.header,
                groupName: undefined,
                nameOverride: undefined
            });
            if (schemaWithExample != null) {
                schema = convertSchemaWithExampleToSchema({
                    schema: schemaWithExample
                });
            }
        }
        result.push({
            ...header,
            schema: schema
        });
    }
    return result;
}
