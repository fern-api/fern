import { RawSchemas } from "@fern-api/fern-definition-schema";
import { GlobalParameter } from "@fern-api/openapi-ir";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";

export function buildGlobalParameters(context: OpenApiIrConverterContext): void {
    const globalParameters = context.ir.globalParameters;
    if (globalParameters == null || globalParameters.length === 0) {
        return;
    }

    for (const param of globalParameters) {
        const schema = convertGlobalParameterToSchema(param);
        context.builder.addGlobalParameter({
            name: param.name,
            schema
        });
    }
}

function convertGlobalParameterToSchema(param: GlobalParameter): RawSchemas.GlobalParameterDeclarationSchema {
    const schema: RawSchemas.GlobalParameterDeclarationSchema = {};

    if (param.in != null) {
        schema.in = param.in;
    }
    if (param.target != null) {
        schema.target = param.target;
    }
    if (param.type != null) {
        schema.type = param.type;
    }
    if (param.env != null) {
        schema.env = param.env;
    }
    if (param.default != null) {
        schema.default = param.default;
    }
    if (param.optional != null) {
        schema.optional = param.optional;
    }
    if (param.apply != null) {
        schema.apply = param.apply;
    }
    if (param.parameterName != null) {
        schema["parameter-name"] = param.parameterName;
    }
    if (param.docs != null) {
        schema.docs = param.docs;
    }

    return schema;
}
