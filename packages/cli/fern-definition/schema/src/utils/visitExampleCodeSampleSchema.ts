import { assertNever } from "@fern-api/core-utils";

import { ExampleCodeSampleSchema, ExampleCodeSampleSchemaLanguage, ExampleCodeSampleSchemaSdk } from "../schemas";

export interface ExampleCodeSampleVisitor<R> {
    language: (languageScheme: ExampleCodeSampleSchemaLanguage) => R;
    sdk: (sdkScheme: ExampleCodeSampleSchemaSdk) => R;
}

export function visitExampleCodeSampleSchema<R>(
    codeSample: ExampleCodeSampleSchema,
    visitor: ExampleCodeSampleVisitor<R>
): R {
    if (isExampleCodeSampleSchemaSdk(codeSample)) {
        return visitor.sdk(codeSample);
    }
    if (isExampleCodeSampleSchemaLanguage(codeSample)) {
        return visitor.language(codeSample);
    }
    assertNever(codeSample);
}

export function isExampleCodeSampleSchemaSdk(
    codeSample: ExampleCodeSampleSchema
): codeSample is ExampleCodeSampleSchemaSdk {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (codeSample as ExampleCodeSampleSchemaSdk).sdk != null;
}
export function isExampleCodeSampleSchemaLanguage(
    codeSample: ExampleCodeSampleSchema
): codeSample is ExampleCodeSampleSchemaLanguage {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (codeSample as ExampleCodeSampleSchemaLanguage).language != null;
}
