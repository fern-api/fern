import { FernOpenapiIr, GlobalHeader } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { convertSchemaWithExampleToSchema } from "../../../schema/utils/convertSchemaWithExampleToSchema";
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
