import { SwiftFile } from "@fern-api/swift-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object";

export function generateInlinedRequestModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {
    const files: SwiftFile[] = [];
    Object.entries(context.ir.services).forEach(([_, service]) => {
        service.endpoints.forEach((endpoint) => {
            if (endpoint.requestBody?.type === "inlinedRequestBody") {
                const generator = new ObjectGenerator({
                    name: context.project.symbolRegistry.getInlineRequestTypeSymbolOrThrow(
                        endpoint.id,
                        endpoint.requestBody.name.pascalCase.unsafeName
                    ),
                    directory: context.requestsDirectory,
                    properties: endpoint.requestBody.properties,
                    extendedProperties: endpoint.requestBody.extendedProperties,
                    context
                });
                files.push(generator.generate());
            }
        });
    });
    return files;
}
