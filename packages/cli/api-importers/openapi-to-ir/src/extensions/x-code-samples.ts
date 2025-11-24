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

function maybeResolveSourceReference(source: unknown, baseDir: string | undefined): string | undefined {
    if (source == null) {
        return undefined;
    }

    if (typeof source === "string") {
        return source;
    }

    if (isCodeReference(source)) {
        const resolvedPath = resolvePath(baseDir ?? process.cwd(), source.$ref);
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

export declare namespace RedoclyCodeSamplesExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
        baseDir?: string;
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class RedoclyCodeSamplesExtension extends AbstractExtension<RedoclyCodeSamplesExtension.Output> {
    private readonly operation: object;
    private readonly baseDir: string | undefined;

    public readonly key = "x-codeSamples";

    constructor({ context, breadcrumbs, operation, baseDir }: RedoclyCodeSamplesExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
        this.baseDir = baseDir;
    }

    public convert(): RedoclyCodeSamplesExtension.Output | undefined {
        const operationRecord = isPlainObject(this.operation) ? (this.operation as Record<string, unknown>) : {};
        const extensionValueCamel = operationRecord["x-codeSamples"];
        const extensionValueKebab = operationRecord["x-code-samples"];

        const camelArray = Array.isArray(extensionValueCamel) ? extensionValueCamel : [];
        const kebabArray = Array.isArray(extensionValueKebab) ? extensionValueKebab : [];
        const codeSamplesArray = [...camelArray, ...kebabArray];

        if (codeSamplesArray.length === 0) {
            return undefined;
        }

        const resolvedCodeSamples: RawSchemas.ExampleCodeSampleSchema[] = [];

        for (const sample of codeSamplesArray) {
            if (!isPlainObject(sample)) {
                continue;
            }

            const sampleRecord = sample as Record<string, unknown>;
            const lang = sampleRecord.lang;
            const label = sampleRecord.label;
            const source = sampleRecord.source;

            if (typeof lang !== "string") {
                continue;
            }

            const resolvedSource = maybeResolveSourceReference(source, this.baseDir);
            if (resolvedSource == null) {
                continue;
            }

            resolvedCodeSamples.push({
                name: typeof label === "string" ? label : lang,
                language: lang,
                code: resolvedSource,
                install: undefined,
                docs: undefined
            });
        }

        if (resolvedCodeSamples.length === 0) {
            return undefined;
        }

        return [
            {
                "code-samples": resolvedCodeSamples
            }
        ];
    }
}
