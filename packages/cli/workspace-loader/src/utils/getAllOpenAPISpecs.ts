import { TaskContext } from "@fern-api/task-context";
import { ProtobufOpenAPIGenerator } from "../protobuf/ProtobufOpenAPIGenerator";
import { OpenAPISpec, ProtobufSpec, Spec } from "../types/Workspace";

export async function getAllOpenAPISpecs({
    context,
    specs
}: {
    context: TaskContext;
    specs: Spec[];
}): Promise<OpenAPISpec[]> {
    const generator = new ProtobufOpenAPIGenerator({ context });
    const openApiSpecs: OpenAPISpec[] = specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi");
    const protobufSpecs: ProtobufSpec[] = specs.filter((spec): spec is ProtobufSpec => spec.type === "protobuf");
    const convertedOpenApiSpecs = await Promise.all(
        protobufSpecs.map(async (protobufSpec) => {
            return convertProtobufToOpenAPI({ generator, protobufSpec });
        })
    );
    return [...openApiSpecs, ...convertedOpenApiSpecs];
}

export async function convertProtobufToOpenAPI({
    generator,
    protobufSpec
}: {
    generator: ProtobufOpenAPIGenerator;
    protobufSpec: ProtobufSpec;
}): Promise<OpenAPISpec> {
    const openAPIAbsoluteFilePath = await generator.generate({
        absoluteFilepathToProtobufRoot: protobufSpec.absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget: protobufSpec.absoluteFilepathToProtobufTarget,
        local: protobufSpec.generateLocally
    });
    return {
        type: "openapi",
        absoluteFilepath: openAPIAbsoluteFilePath,
        absoluteFilepathToOverrides: protobufSpec.absoluteFilepathToOverrides,
        settings: protobufSpec.settings,
        source: {
            type: "protobuf",
            file: protobufSpec.absoluteFilepathToProtobufTarget
        }
    };
}
