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
    const headerWithoutXPrefix = header.name.replace(/^x-|^X-/, "");
    return {
        name: header.parameterNameOverride != null ? header.parameterNameOverride : camelCase(headerWithoutXPrefix),
        docs: header.description ?? undefined,
        type: getTypeFromTypeReference(typeReference)
    };
}
