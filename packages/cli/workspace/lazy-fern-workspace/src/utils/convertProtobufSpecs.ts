import { OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, listFiles, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { ProtobufOpenAPIGenerator } from "../protobuf/ProtobufOpenAPIGenerator.js";

/** The OpenAPI specs converted from one protobuf spec: one per target, or one per .proto file under the root. */
export interface ConvertedProtobufSpec {
    protobufSpec: ProtobufSpec;
    openApiSpecs: OpenAPISpec[];
}

/**
 * Converts protobuf specs to OpenAPI with buf and Fern's protoc-gen-openapi fork. Results keep the
 * protobuf spec they came from, in generation order (grouped by proto root).
 */
export async function convertProtobufSpecs({
    context,
    specs,
    relativePathToDependency
}: {
    context: TaskContext;
    specs: ProtobufSpec[];
    relativePathToDependency?: RelativeFilePath;
}): Promise<ConvertedProtobufSpec[]> {
    const generator = new ProtobufOpenAPIGenerator({ context });

    // Group protobuf specs by their proto root so we can prepare a single
    // working directory per root, then generate each target from it.
    const specsByRoot = new Map<string, ProtobufSpec[]>();
    for (const spec of specs) {
        const key = spec.absoluteFilepathToProtobufRoot;
        const group = specsByRoot.get(key) ?? [];
        group.push(spec);
        specsByRoot.set(key, group);
    }

    const converted: ConvertedProtobufSpec[] = [];

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

        for (const spec of group) {
            // An explicit target, or every .proto file under the root for specs without one.
            const targets =
                spec.absoluteFilepathToProtobufTarget != null
                    ? [spec.absoluteFilepathToProtobufTarget]
                    : await listFiles(spec.absoluteFilepathToProtobufRoot, "proto");

            // Generate each target sequentially using the shared working dir.
            // Sequential because protoc-gen-openapi writes to a fixed output
            // path and buf generate is not safe to run concurrently in the
            // same directory.
            const openApiSpecs: OpenAPISpec[] = [];
            for (const target of targets) {
                const result = await generator.generateFromPrepared({
                    preparedDir,
                    absoluteFilepathToProtobufRoot: spec.absoluteFilepathToProtobufRoot,
                    absoluteFilepathToProtobufTarget: target
                });
                openApiSpecs.push(makeOpenApiSpec({ result, protobufSpec: spec, relativePathToDependency, target }));
            }
            converted.push({ protobufSpec: spec, openApiSpecs });
        }
    }

    return converted;
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
