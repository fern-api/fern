import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildFernDefinition } from "./buildFernDefinition.js";
import { OpenApiIrConverterContext, OpenApiIrConverterContextOpts } from "./OpenApiIrConverterContext.js";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    packageMarkerFile: PackageMarkerFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert(opts: OpenApiIrConverterContextOpts): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext(opts);
    if (context.options.respectOptionalRequestBody) {
        context.logger.warn(
            "The `respect-optional-request-body` setting is deprecated and no longer has any effect. " +
                "A request body that OpenAPI does not mark as required is now always described as omittable in the IR, " +
                "and each SDK generator opts in to that behaviour through its own configuration."
        );
    }
    return buildFernDefinition(context);
}
