import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { Header } from "@fern-fern/openapi-ir-model/finalIr";
import { camelCase } from "lodash-es";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildHeader({
    header,
    context,
    fileContainingReference
}: {
    header: Header;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
}): RawSchemas.HttpHeaderSchema {
    const typeReference = buildTypeReference({
        schema: header.schema,
        context,
        fileContainingReference
    });
    const headerType = getTypeFromTypeReference(typeReference);
    const headerWithoutXPrefix = header.name.replace(/^x-|^X-/, "");
    const headerVariableName =
        header.parameterNameOverride != null ? header.parameterNameOverride : camelCase(headerWithoutXPrefix);
    if (header.description == null && header.name === headerVariableName) {
        return headerType;
    }
    const headerSchema: RawSchemas.HttpHeaderSchema = {
        type: headerType
    };
    if (headerVariableName != null && headerVariableName !== header.name) {
        headerSchema.name = headerVariableName;
    }
    if (header.description != null) {
        headerSchema.docs = header.description;
    }
    return headerSchema;
}
