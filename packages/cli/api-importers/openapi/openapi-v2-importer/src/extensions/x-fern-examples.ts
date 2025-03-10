import { z } from "zod";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";
import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";

const CodeSampleSchema = z.object({
    sdk: z.string(),
    code: z.string()
});

const ExampleSchema = z.object({
    "path-parameters": z.record(z.any()).optional(),
    "query-parameters": z.record(z.any()).optional(),
    request: z.any().optional(),
    response: z.any().optional(),
    "code-samples": z.array(CodeSampleSchema).optional()
});

export declare namespace FernExamplesExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
    }

    export interface Example {
        pathParameters?: Record<string, unknown>;
        queryParameters?: Record<string, unknown>;
        request?: unknown;
        response?: unknown;
        codeSamples?: Array<{
            sdk: string;
            code: string;
        }>;
    }

    export type Output = Example[];
}

export class FernExamplesExtension extends AbstractExtension<OpenAPIConverterContext3_1, FernExamplesExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-examples";

    constructor({ breadcrumbs, operation }: FernExamplesExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (!Array.isArray(extensionValue)) {
            errorCollector.collect({
                message: `x-fern-examples must be an array but received ${typeof extensionValue}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        const examples: FernExamplesExtension.Example[] = [];

        for (const example of extensionValue) {
            const result = ExampleSchema.safeParse(example);
            if (!result.success) {
                errorCollector.collect({
                    message: `Invalid x-fern-examples entry: ${result.error.message}`,
                    path: this.breadcrumbs
                });
                continue;
            }

            examples.push({
                pathParameters: result.data["path-parameters"],
                queryParameters: result.data["query-parameters"],
                request: result.data.request,
                response: result.data.response,
                codeSamples: result.data["code-samples"]
            });
        }

        return examples;
    }
}
