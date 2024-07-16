import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { ReadmeOpenAPIExtension } from "./readmeExtensions";

// https://docs.readme.com/main/docs/openapi-extensions#custom-code-samples
interface ReadmeCodeSample {
    language: string;
    code: string | { $ref: string };
    name?: string;
    install?: string;
}

function isReadMeCodeSamples(maybeCodeSamples: unknown): maybeCodeSamples is ReadmeCodeSample[] {
    if (!Array.isArray(maybeCodeSamples)) {
        return false;
    }
    for (const maybeCodeSample of maybeCodeSamples) {
        if (!isPlainObject(maybeCodeSample)) {
            return false;
        }
        if (typeof maybeCodeSample.language !== "string") {
            return false;
        }
        if (
            typeof maybeCodeSample.code === "string" ||
            (isPlainObject(maybeCodeSample.code) && maybeCodeSample.code.$ref !== null)
        ) {
            return true;
        }
    }
    return false;
}

export function getRawReadmeCodeSamples(
    operationObject: OpenAPIV3.OperationObject
): RawSchemas.UnresolvedExampleCodeSampleSchema[] {
    const readme = getExtension<unknown>(operationObject, ReadmeOpenAPIExtension.README_EXT);

    if (!isPlainObject(readme)) {
        return [];
    }

    const readmeCodeSamples = readme["code-samples"];

    if (!isReadMeCodeSamples(readmeCodeSamples)) {
        return [];
    }

    const customCodeSamples: RawSchemas.UnresolvedExampleCodeSampleSchema[] = [];
    for (const codeSample of readmeCodeSamples) {
        customCodeSamples.push({
            name: codeSample.name,
            language: codeSample.language,
            code: codeSample.code,
            install: codeSample.install,
            docs: undefined
        });
    }
    return customCodeSamples;
}
