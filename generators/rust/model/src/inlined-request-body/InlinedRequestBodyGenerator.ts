import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { HttpRequestBody, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "./ObjectGenerator";

export class InlinedRequestBodyGenerator {
    private readonly ir: IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(ir: IntermediateRepresentation, context: ModelGeneratorContext) {
        this.ir = ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find inlined request bodies
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (this.isInlinedRequestBody(endpoint.requestBody)) {
                    const file = this.generateInlinedRequestBodyFile(endpoint.requestBody);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private isInlinedRequestBody(
        requestBody: HttpRequestBody | undefined
    ): requestBody is HttpRequestBody.InlinedRequestBody {
        return requestBody?.type === "inlinedRequestBody";
    }

    private generateInlinedRequestBodyFile(requestBody: HttpRequestBody.InlinedRequestBody): RustFile | null {
        try {
            const requestName = requestBody.name.pascalCase.safeName;
            const filename = this.context.getFilenameForInlinedRequestBody(requestName);

            // Create ObjectGenerator to generate the struct
            const objectGenerator = new ObjectGenerator({
                name: requestName,
                properties: [...(requestBody.properties || []), ...(requestBody.extendedProperties || [])],
                extendedProperties: [],
                docsContent: requestBody.docs,
                context: this.context
            });

            // Generate the file content
            const fileContents = objectGenerator.generateFileContents();

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents
            });
        } catch (error) {
            // Log error but don't fail the entire generation
            this.context.logger?.warn(`Failed to generate inlined request body file: ${error}`);
            return null;
        }
    }
}
