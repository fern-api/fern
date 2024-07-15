import { isPlainObject } from "@fern-api/core-utils";
import { CustomCodeSample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { ReadmeOpenAPIExtension } from "./readmeExtensions";

interface ReferencedCodeSample {
    $ref: string;
}

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
        if (typeof maybeCodeSample.code !== "string") {
            throw new Error(
                `Code is actually of type: ${typeof maybeCodeSample.code} ${JSON.stringify(maybeCodeSample.code)}`
            );
        }
        if (
            typeof maybeCodeSample.code === "string" ||
            (isPlainObject(maybeCodeSample.code) &&
                maybeCodeSample.code["$ref"] !== undefined &&
                typeof maybeCodeSample.code["$ref"] === "string")
        ) {
            return true;
        }
    }
    return false;
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
