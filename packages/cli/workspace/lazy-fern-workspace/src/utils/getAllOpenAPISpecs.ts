import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, listFiles, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { ProtobufOpenAPIGenerator } from "../protobuf/ProtobufOpenAPIGenerator.js";

export async function getAllOpenAPISpecs({
    context,
    specs,
    relativePathToDependency
}: {
    context: TaskContext;
    specs: Spec[];
    relativePathToDependency?: RelativeFilePath;
}): Promise<OpenAPISpec[]> {
    const generator = new ProtobufOpenAPIGenerator({ context });
    const openApiSpecs: OpenAPISpec[] = specs
        .filter((spec): spec is OpenAPISpec => spec.type === "openapi")
        .map((spec) => {
            return { ...spec, relativePathToDependency };
        });
    const protobufSpecs: ProtobufSpec[] = specs.filter((spec): spec is ProtobufSpec => spec.type === "protobuf");
    const openApiSpecsFromProto = await Promise.all(
        protobufSpecs.map(async (protobufSpec) => {
            if (protobufSpec.absoluteFilepathToProtobufTarget != null) {
                const result = await convertProtobufToOpenAPI({ generator, protobufSpec, relativePathToDependency });
                return result ? [result.openApiSpec] : [];
            }
            const allProtobufTargetFilepaths = await listFiles(protobufSpec.absoluteFilepathToProtobufRoot, "proto");
            if (allProtobufTargetFilepaths.length === 0) {
                return [];
            }

            // Prepare a single working directory: copies proto root, resolves
            // dependencies, and checks binaries once for all files.
            const preparedDir = await generator.prepare({
                absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
                relativeFilepathToProtobufRoot: protobufSpec.relativeFilepathToProtobufRoot,
                local: protobufSpec.generateLocally,
                deps: protobufSpec.dependencies
            });

            // Generate each file sequentially using the shared working dir.
            // Sequential because protoc-gen-openapi writes to a fixed output
            // path and buf generate is not safe to run concurrently in the
            // same directory.
            const openApiSpecs: OpenAPISpec[] = [];
            for (const file of allProtobufTargetFilepaths) {
                const result = await generator.generateFromPrepared({
                    preparedDir,
                    absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
                    absoluteFilepathToProtobufTarget: file
                });
                openApiSpecs.push(makeOpenApiSpec({ result, protobufSpec, relativePathToDependency, target: file }));
            }

            return openApiSpecs;
        })
    );

    const flattenedSpecs = openApiSpecsFromProto.flat().filter((spec) => isNonNullish(spec));
    return [...openApiSpecs, ...flattenedSpecs];
}

export async function convertProtobufToOpenAPI({
    generator,
    protobufSpec,
    relativePathToDependency
}: {
    generator: ProtobufOpenAPIGenerator;
    protobufSpec: ProtobufSpec;
    relativePathToDependency?: RelativeFilePath;
}): Promise<{ openApiSpec: OpenAPISpec } | undefined> {
    if (protobufSpec.absoluteFilepathToProtobufTarget == null) {
        return undefined;
    }
    const result = await generator.generate({
        absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget: protobufSpec.absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot: protobufSpec.relativeFilepathToProtobufRoot,
        local: protobufSpec.generateLocally,
        deps: protobufSpec.dependencies
    });
    return {
        openApiSpec: makeOpenApiSpec({
            result,
            protobufSpec,
            relativePathToDependency,
            target: protobufSpec.absoluteFilepathToProtobufTarget
        })
    };
}

function makeOpenApiSpec({
    result,
    protobufSpec,
    relativePathToDependency,
    target
}: {
    result: { absoluteFilepath: AbsoluteFilePath; bufLockContents: string | undefined };
    protobufSpec: ProtobufSpec;
    relativePathToDependency?: RelativeFilePath;
    target: AbsoluteFilePath;
}): OpenAPISpec {
    return {
        type: "openapi",
        absoluteFilepath: result.absoluteFilepath,
        absoluteFilepathToOverrides: protobufSpec.absoluteFilepathToOverrides,
        absoluteFilepathToOverlays: undefined,
        settings: protobufSpec.settings,
        source: {
            type: "protobuf",
            relativePathToDependency,
            root: protobufSpec.absoluteFilepathToProtobufRoot,
            file: target
        }
    };
}
