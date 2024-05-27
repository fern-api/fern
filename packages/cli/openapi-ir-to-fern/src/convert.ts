import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { buildFernDefinition } from "./buildFernDefinition";
import { OpenApiIrConverterContext, OpenApiIrConverterContextOpts } from "./OpenApiIrConverterContext";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    packageMarkerFile: PackageMarkerFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert(opts: OpenApiIrConverterContextOpts): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext(opts);
    return buildFernDefinition(context);
}
