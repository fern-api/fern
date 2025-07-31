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
                return convertProtobufToOpenAPI({ generator, protobufSpec, relativePathToDependency });
            }
            const allProtobufTargetFilepaths = await listFiles(protobufSpec.absoluteFilepathToProtobufRoot, "proto");
            const openApiSpecs = await Promise.all(
                allProtobufTargetFilepaths.map((file) => {
                    return convertProtobufToOpenAPI({
                        generator,
                        protobufSpec: {
                            ...protobufSpec,
                            absoluteFilepathToProtobufTarget: file
                        },
                        relativePathToDependency
                    });
                })
            );
            return openApiSpecs.filter((spec) => isNonNullish(spec));
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
}): Promise<OpenAPISpec | undefined> {
    if (protobufSpec.absoluteFilepathToProtobufTarget == null) {
        return undefined;
    }
    const openAPIAbsoluteFilePath = await generator.generate({
        absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget: protobufSpec.absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot: protobufSpec.relativeFilepathToProtobufRoot,
        local: protobufSpec.generateLocally
    });
    return {
        type: "openapi",
        absoluteFilepath: openAPIAbsoluteFilePath,
        absoluteFilepathToOverrides: protobufSpec.absoluteFilepathToOverrides,
        settings: protobufSpec.settings,
        source: {
            type: "protobuf",
            relativePathToDependency,
            root: protobufSpec.absoluteFilepathToProtobufRoot,
            file: protobufSpec.absoluteFilepathToProtobufTarget
        }
    };
}
