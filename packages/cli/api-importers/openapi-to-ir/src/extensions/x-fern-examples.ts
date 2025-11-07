import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbstractExtension } from "@fern-api/v3-importer-commons";
import { existsSync, readFileSync } from "fs";
import { resolve as resolvePath } from "path";

interface CodeReference {
    $ref: string;
}

function isCodeReference(value: unknown): value is CodeReference {
    return isPlainObject(value) && typeof (value as { $ref?: unknown }).$ref === "string";
}

function maybeResolveCodeReference(code: unknown, baseDir: string | undefined): string | undefined {
    if (code == null) {
        return undefined;
    }

    if (typeof code === "string") {
        return code;
    }

    if (isCodeReference(code)) {
        const resolvedPath = resolvePath(baseDir ?? process.cwd(), code.$ref);
        if (existsSync(resolvedPath)) {
            try {
                const fileContent = readFileSync(resolvedPath, "utf-8");
                return fileContent;
            } catch (error) {
                return undefined;
            }
        }
    }

    return undefined;
}

function resolveCodeSamples(codeSamples: unknown, baseDir: string | undefined): RawSchemas.ExampleCodeSampleSchema[] {
    if (!Array.isArray(codeSamples)) {
        return [];
    }

    const resolved: RawSchemas.ExampleCodeSampleSchema[] = [];
    for (const sample of codeSamples) {
        if (!isPlainObject(sample)) {
            continue;
        }

        const sampleRecord = sample as Record<string, unknown>;
        const code = maybeResolveCodeReference(sampleRecord.code, baseDir);
        if (code != null) {
            resolved.push({
                ...sample,
                code
            } as RawSchemas.ExampleCodeSampleSchema);
        }
    }

    return resolved;
}

export declare namespace FernExamplesExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
        baseDir?: string;
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly operation: object;
    private readonly baseDir: string | undefined;

    public readonly key = "x-fern-examples";

    constructor({ context, breadcrumbs, operation, baseDir }: FernExamplesExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
        this.baseDir = baseDir;
    }

    public convert(): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const exampleArray = Array.isArray(extensionValue) ? extensionValue : [];

        const resolvedExamples = exampleArray.map((example) => {
            if (!isPlainObject(example)) {
                return example;
            }

            const exampleRecord = example as Record<string, unknown>;
            const codeSamples = exampleRecord["code-samples"];
            if (codeSamples != null) {
                const resolvedCodeSamples = resolveCodeSamples(codeSamples, this.baseDir);
                return {
                    ...example,
                    "code-samples": resolvedCodeSamples
                };
            }

            return example;
        });

        const validatedExampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema = resolvedExamples.filter(
            (example) => {
                const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(example);
                if (!maybeFernExample.ok) {
                    this.context.errorCollector.collect({
                        message: `Failed to parse x-fern-example in ${this.breadcrumbs.join(".")}`,
                        path: this.breadcrumbs
                    });
                }
                return maybeFernExample.ok;
            }
        );

        return validatedExampleEndpointCalls;
    }
}
