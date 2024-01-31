import { isPlainObject } from "@fern-api/core-utils";
import { CustomCodeSample } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";
import { ReadmeOpenAPIExtension } from "./readmeExtensions";

export function getFernCodeSamples(operationObject: OpenAPIV3.OperationObject): CustomCodeSample[] {
    const maybeCodeSamples = getExtension<unknown>(operationObject, FernOpenAPIExtension.CUSTOM_CODE_SAMPLES);
    if (maybeCodeSamples == null || !Array.isArray(maybeCodeSamples)) {
        return [];
    }
    const customCodeSamples: CustomCodeSample[] = [];

    for (const maybeCodeSample of maybeCodeSamples) {
        if (typeof maybeCodeSample !== "object") {
            continue;
        }
        const codeSample = maybeCodeSample as CustomCodeSample;
        if (typeof codeSample.language !== "string" || typeof codeSample.code !== "string") {
            continue;
        }
        customCodeSamples.push({
            name: codeSample.name,
            language: codeSample.language,
            code: codeSample.code,
            install: codeSample.install,
            description: codeSample.description
        });
    }
    return customCodeSamples;
}

export function getReadmeCodeSamples(operationObject: OpenAPIV3.OperationObject): CustomCodeSample[] {
    const maybeCodeSamples = getExtension<unknown>(operationObject, ReadmeOpenAPIExtension.README_EXT);

    if (!isPlainObject(maybeCodeSamples)) {
        return [];
    }

    const readmeCodeSamples = maybeCodeSamples["code-samples"];

    if (readmeCodeSamples == null || !Array.isArray(readmeCodeSamples)) {
        return [];
    }

    const customCodeSamples: CustomCodeSample[] = [];
    for (const maybeCodeSample of readmeCodeSamples) {
        if (typeof maybeCodeSample !== "object") {
            continue;
        }
        const codeSample = maybeCodeSample as CustomCodeSample;
        if (typeof codeSample.language !== "string" || typeof codeSample.code !== "string") {
            continue;
        }
        customCodeSamples.push({
            name: codeSample.name,
            language: codeSample.language,
            code: codeSample.code,
            install: undefined,
            description: undefined
        });
    }
    return customCodeSamples;
}
