import { RelativeFilePath } from "@fern-api/fs-utils";
import { Header } from "@fern-api/openapi-ir";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { camelCase } from "lodash-es";
import { buildNonInlineableTypeReference, buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
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
    const typeReference = buildNonInlineableTypeReference({
        schema: header.schema,
        context,
        fileContainingReference,
        namespace
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
