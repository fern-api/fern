import { SwiftFile } from "@fern-api/swift-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object";

export function generateInlinedRequestModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {
    const files: SwiftFile[] = [];
    Object.entries(context.ir.services).forEach(([_, service]) => {
        service.endpoints.forEach((endpoint) => {
            if (endpoint.requestBody?.type === "inlinedRequestBody") {
                const generator = new ObjectGenerator(
                    context.project.symbolRegistry.getRequestSymbolOrThrow(
                        endpoint.requestBody.name.pascalCase.unsafeName
                    ),
                    context.requestsDirectory,
                    endpoint.requestBody.properties,
                    endpoint.requestBody.extendedProperties
                );
                files.push(generator.generate());
            }
        });
    });
    return files;
}
