import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbstractExtension } from "@fern-api/v3-importer-commons";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { resolve as resolvePath } from "path";

interface CodeReference {
    $ref: string;
}

function isCodeReference(value: unknown): value is CodeReference {
    return isPlainObject(value) && typeof (value as Record<string, unknown>).$ref === "string";
}

async function maybeResolveCodeReference(code: string | CodeReference | undefined): Promise<string | undefined> {
    if (code == null) {
        return undefined;
    }

    if (typeof code === "string") {
        return code;
    }

    if (isCodeReference(code)) {
        const resolvedPath = resolvePath(process.cwd(), code.$ref);
        if (existsSync(resolvedPath)) {
            try {
                const fileContent = await readFile(resolvedPath, "utf-8");
                return fileContent;
            } catch (error) {
                return undefined;
            }
        }
    }

    return undefined;
}

async function resolveCodeSamples(codeSamples: unknown[] | undefined): Promise<RawSchemas.ExampleCodeSampleSchema[]> {
    if (!codeSamples || !Array.isArray(codeSamples)) {
        return [];
    }

    const resolved: RawSchemas.ExampleCodeSampleSchema[] = [];
    for (const sample of codeSamples) {
        if (!isPlainObject(sample)) {
            continue;
        }

        const sampleRecord = sample as Record<string, unknown>;
        const code = await maybeResolveCodeReference(sampleRecord.code);
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
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly operation: object;

    public readonly key = "x-fern-examples";

    constructor({ context, breadcrumbs, operation }: FernExamplesExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public async convert(): Promise<FernExamplesExtension.Output | undefined> {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const exampleArray = Array.isArray(extensionValue) ? extensionValue : [];

        const resolvedExamples = await Promise.all(
            exampleArray.map(async (example) => {
                if (!isPlainObject(example)) {
                    return example;
                }

                const exampleRecord = example as Record<string, unknown>;
                const codeSamples = exampleRecord["code-samples"];
                if (codeSamples) {
                    const resolvedCodeSamples = await resolveCodeSamples(codeSamples);
                    return {
                        ...example,
                        "code-samples": resolvedCodeSamples
                    };
                }

                return example;
            })
        );

        const validatedExampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema = resolvedExamples.filter(
            (example) => {
                const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(example);
                if (!maybeFernExample.ok) {
                    this.context.errorCollector.collect({
                        message: `Failed to parse x-fern-example in ${this.breadcrumbs.join(".")} due to ${JSON.stringify(maybeFernExample.errors)}`,
                        path: this.breadcrumbs
                    });
                }
                return maybeFernExample.ok;
            }
        );

        return validatedExampleEndpointCalls;
    }
}
