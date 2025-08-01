import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { isNonNullish } from "@fern-api/core-utils";
import { listFiles, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { ProtobufOpenAPIGenerator } from "../protobuf/ProtobufOpenAPIGenerator";

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
            let accumulatedBufLockContents: string | undefined;
            const openApiSpecs: OpenAPISpec[] = [];

            for (const file of allProtobufTargetFilepaths) {
                const result = await convertProtobufToOpenAPI({
                    generator,
                    protobufSpec: {
                        ...protobufSpec,
                        absoluteFilepathToProtobufTarget: file
                    },
                    relativePathToDependency,
                    existingBufLockContents: accumulatedBufLockContents
                });
                if (result != null) {
                    openApiSpecs.push(result.openApiSpec);
                    if (result.bufLockContents != null) {
                        accumulatedBufLockContents = result.bufLockContents;
                    }
                }
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
    relativePathToDependency,
    existingBufLockContents
}: {
    generator: ProtobufOpenAPIGenerator;
    protobufSpec: ProtobufSpec;
    relativePathToDependency?: RelativeFilePath;
    existingBufLockContents?: string;
}): Promise<{ bufLockContents: string | undefined; openApiSpec: OpenAPISpec } | undefined> {
    if (protobufSpec.absoluteFilepathToProtobufTarget == null) {
        return undefined;
    }
    const openAPIAbsoluteFilePath = await generator.generate({
        absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget: protobufSpec.absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot: protobufSpec.relativeFilepathToProtobufRoot,
        local: protobufSpec.generateLocally,
        deps: protobufSpec.dependencies,
        existingBufLockContents
    });
    return {
        bufLockContents: openAPIAbsoluteFilePath.bufLockContents,
        openApiSpec: {
            type: "openapi",
            absoluteFilepath: openAPIAbsoluteFilePath.absoluteFilepath,
            absoluteFilepathToOverrides: protobufSpec.absoluteFilepathToOverrides,
            settings: protobufSpec.settings,
            source: {
                type: "protobuf",
                relativePathToDependency,
                root: protobufSpec.absoluteFilepathToProtobufRoot,
                file: protobufSpec.absoluteFilepathToProtobufTarget
            }
        }
    };
}
