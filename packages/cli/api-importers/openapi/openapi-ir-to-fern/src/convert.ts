import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext, OpenApiIrConverterContextOpts } from "./OpenApiIrConverterContext";
import { buildFernDefinition } from "./buildFernDefinition";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    packageMarkerFile: PackageMarkerFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert(opts: OpenApiIrConverterContextOpts): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext(opts);
    return buildFernDefinition(context);
}
