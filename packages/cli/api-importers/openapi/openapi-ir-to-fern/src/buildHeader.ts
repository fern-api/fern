import { camelCase } from "lodash-es";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Header } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildTypeReference } from "./buildTypeReference";
import { convertAvailability } from "./utils/convertAvailability";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildHeader({
    header,
    context,
    fileContainingReference,
    namespace
}: {
    header: Header;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
    namespace: string | undefined;
}): RawSchemas.HttpHeaderSchema {
    const typeReference = buildTypeReference({
        schema: header.schema,
        context,
        fileContainingReference,
        namespace,
        declarationDepth: 0
    });
    const headerType = getTypeFromTypeReference(typeReference);
    const headerWithoutXPrefix = header.name.replace(/^x-|^X-/, "");
    const headerVariableName =
        header.parameterNameOverride != null ? header.parameterNameOverride : camelCase(headerWithoutXPrefix);
    if (
        header.description == null &&
        header.name === headerVariableName &&
        header.env == null &&
        header.availability == null
    ) {
        return headerType;
    }
    const headerSchema: RawSchemas.HttpHeaderSchema = {
        type: headerType
    };
    if (headerVariableName !== header.name) {
        headerSchema.name = headerVariableName;
    }
    if (header.description != null) {
        headerSchema.docs = header.description;
    }
    if (header.env != null) {
        headerSchema.env = header.env;
    }
    if (header.availability != null) {
        headerSchema.availability = convertAvailability(header.availability);
    }

    return headerSchema;
}
