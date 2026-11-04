import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { type ConvertedProtobufSpec, convertProtobufSpecs } from "./convertProtobufSpecs.js";

export async function getAllOpenAPISpecs({
    context,
    specs,
    relativePathToDependency
}: {
    context: TaskContext;
    specs: Spec[];
    relativePathToDependency?: RelativeFilePath;
}): Promise<OpenAPISpec[]> {
    const converted = await convertProtobufSpecs({
        context,
        specs: specs.filter((spec): spec is ProtobufSpec => spec.type === "protobuf"),
        relativePathToDependency
    });
    return combineOpenAPISpecs({ specs, converted, relativePathToDependency });
}

/** OpenAPI specs first, then every protobuf conversion in generation order. */
export function combineOpenAPISpecs({
    specs,
    converted,
    relativePathToDependency
}: {
    specs: Spec[];
    converted: ConvertedProtobufSpec[];
    relativePathToDependency?: RelativeFilePath;
}): OpenAPISpec[] {
    const openApiSpecs = specs
        .filter((spec): spec is OpenAPISpec => spec.type === "openapi")
        .map((spec) => ({ ...spec, relativePathToDependency }));
    const openApiSpecsFromProto = converted.flatMap(({ openApiSpecs }) =>
        openApiSpecs.map((spec) =>
            spec.source.type === "protobuf" ? { ...spec, source: { ...spec.source, relativePathToDependency } } : spec
        )
    );
    return [...openApiSpecs, ...openApiSpecsFromProto];
}
