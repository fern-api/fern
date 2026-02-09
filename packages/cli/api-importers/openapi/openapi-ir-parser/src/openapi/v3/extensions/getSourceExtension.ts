import { Source } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export function getSourceExtension(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): Source | undefined {
    const sourceFilepath = getExtension<string>(schema, FernOpenAPIExtension.SOURCE);
    if (sourceFilepath == null) {
        return undefined;
    }
    if (sourceFilepath.endsWith(".proto")) {
        return Source.protobuf({ file: sourceFilepath });
    }
    return Source.openapi({ file: sourceFilepath });
}
