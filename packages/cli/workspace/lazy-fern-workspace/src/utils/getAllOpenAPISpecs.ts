import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
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

    // Group protobuf specs by their proto root so we can prepare a single
    // working directory per root, then generate each target from it.
    const specsByRoot = new Map<string, ProtobufSpec[]>();
    for (const spec of protobufSpecs) {
        const key = spec.absoluteFilepathToProtobufRoot;
        const group = specsByRoot.get(key) ?? [];
        group.push(spec);
        specsByRoot.set(key, group);
    }

    const openApiSpecsFromProto: OpenAPISpec[] = [];

    for (const group of specsByRoot.values()) {
        // Use the first spec in the group for the shared prepare() call.
        const representative = group[0];
        if (representative == null) {
            continue;
        }

        const preparedDir = await generator.prepare({
            absoluteFilepathToProtobufRoot: representative.absoluteFilepathToProtobufRoot,
            relativeFilepathToProtobufRoot: representative.relativeFilepathToProtobufRoot,
            local: representative.generateLocally,
            deps: representative.dependencies
        });

        // Collect all targets: explicit targets from specs + discovered files
        // for specs without a target.
        const targetEntries: Array<{ target: AbsoluteFilePath; spec: ProtobufSpec }> = [];
        for (const spec of group) {
            if (spec.absoluteFilepathToProtobufTarget != null) {
                targetEntries.push({ target: spec.absoluteFilepathToProtobufTarget, spec });
            } else {
                const files = await listFiles(spec.absoluteFilepathToProtobufRoot, "proto");
                for (const file of files) {
                    targetEntries.push({ target: file, spec });
                }
            }
        }

        // Generate each target sequentially using the shared working dir.
        // Sequential because protoc-gen-openapi writes to a fixed output
        // path and buf generate is not safe to run concurrently in the
        // same directory.
        for (const { target, spec } of targetEntries) {
            const result = await generator.generateFromPrepared({
                preparedDir,
                absoluteFilepathToProtobufRoot: spec.absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget: target
            });
            openApiSpecsFromProto.push(
                makeOpenApiSpec({ result, protobufSpec: spec, relativePathToDependency, target })
            );
        }
    }

    return [...openApiSpecs, ...openApiSpecsFromProto];
}

function makeOpenApiSpec({
    result,
    protobufSpec,
    relativePathToDependency,
    target
}: {
    result: { absoluteFilepath: AbsoluteFilePath };
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
