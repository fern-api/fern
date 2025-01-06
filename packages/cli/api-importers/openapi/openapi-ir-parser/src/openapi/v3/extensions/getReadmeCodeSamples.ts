import { OpenAPIV3 } from "openapi-types";

import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { CustomCodeSample } from "@fern-api/openapi-ir";

import { getExtension } from "../../../getExtension";
import { ReadmeOpenAPIExtension } from "./readmeExtensions";

// https://docs.readme.com/main/docs/openapi-extensions#custom-code-samples
interface ReadmeCodeSample {
    language: string;
    code: string;
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
        if (typeof maybeCodeSample.language !== "string" || typeof maybeCodeSample.code !== "string") {
            return false;
        }
    }
    return true;
}

export function getReadmeCodeSamples(operationObject: OpenAPIV3.OperationObject): CustomCodeSample[] {
    const readme = getExtension<unknown>(operationObject, ReadmeOpenAPIExtension.README_EXT);

    if (!isPlainObject(readme)) {
        return [];
    }

    const readmeCodeSamples = readme["code-samples"];

    if (!isReadMeCodeSamples(readmeCodeSamples)) {
        return [];
    }

    const customCodeSamples: CustomCodeSample[] = [];
    for (const codeSample of readmeCodeSamples) {
        customCodeSamples.push(
            CustomCodeSample.language({
                name: codeSample.name,
                language: codeSample.language,
                code: codeSample.code,
                install: codeSample.install,
                description: undefined
            })
        );
    }
    return customCodeSamples;
}

export function getRawReadmeCodeSamples(
    operationObject: OpenAPIV3.OperationObject
): RawSchemas.ExampleCodeSampleSchema[] {
    const readme = getExtension<unknown>(operationObject, ReadmeOpenAPIExtension.README_EXT);

    if (!isPlainObject(readme)) {
        return [];
    }

    const readmeCodeSamples = readme["code-samples"];

    if (!isReadMeCodeSamples(readmeCodeSamples)) {
        return [];
    }

    const customCodeSamples: RawSchemas.ExampleCodeSampleSchema[] = [];
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
