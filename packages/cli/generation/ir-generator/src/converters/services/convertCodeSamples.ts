import { RawSchemas, visitExampleCodeSampleSchema } from "@fern-api/fern-definition-schema";
import { ExampleCodeSample, SupportedSdkLanguage } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";

export function convertCodeSample({
    codeSample,
    file
}: {
    codeSample: RawSchemas.ExampleCodeSampleSchema;
    file: FernFileContext;
}): ExampleCodeSample {
    return visitExampleCodeSampleSchema<ExampleCodeSample>(codeSample, {
        language: (languageScheme) =>
            ExampleCodeSample.language({
                name: languageScheme.name != null ? file.casingsGenerator.generateName(languageScheme.name) : undefined,
                docs: languageScheme.docs,
                language: languageScheme.language,
                code: languageScheme.code,
                install: languageScheme.install
            }),
        sdk: (sdkScheme) =>
            ExampleCodeSample.sdk({
                name: sdkScheme.name != null ? file.casingsGenerator.generateName(sdkScheme.name) : undefined,
                docs: sdkScheme.docs,
                sdk: removeSdkAlias(sdkScheme.sdk),
                code: sdkScheme.code
            })
    });
}

function removeSdkAlias(sdk: RawSchemas.SupportedSdkLanguageSchema): SupportedSdkLanguage {
    switch (sdk) {
        case "js":
            return "javascript";
        case "node":
            return "javascript";
        case "ts":
            return "typescript";
        case "nodets":
            return "typescript";
        case "golang":
            return "go";
        case "dotnet":
            return "csharp";
        case "c#":
            return "csharp";
        case "jvm":
            return "java";
        default:
            return sdk;
    }
}
