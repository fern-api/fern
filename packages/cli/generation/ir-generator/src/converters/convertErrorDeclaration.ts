import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ErrorDeclaration, FernIr } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext.js";
import { ExampleResolver } from "../resolvers/ExampleResolver.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { parseErrorName } from "../utils/parseErrorName.js";
import { convertTypeReferenceExample } from "./type-declarations/convertExampleType.js";

export function convertErrorDeclaration({
    errorName,
    errorDeclaration,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    errorName: string;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ErrorDeclaration {
    const examples: FernIr.ExampleError[] = [];
    if (errorDeclaration.type != null && errorDeclaration.examples != null) {
        for (const example of errorDeclaration.examples) {
            examples.push({
                name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
                docs: example.docs,
                jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({
                    example: example.value,
                    file
                }).resolvedExample,
                shape: convertTypeReferenceExample({
                    example: example.value,
                    rawTypeBeingExemplified: errorDeclaration.type,
                    fileContainingRawTypeReference: file,
                    fileContainingExample: file,
                    typeResolver,
                    exampleResolver,
                    workspace
                })
            });
        }
    }

    return {
        name: parseErrorName({
            errorName,
            file
        }),
        discriminantValue: file.casingsGenerator.generateNameAndWireValue({
            wireValue: errorName,
            name: errorName
        }),
        docs: typeof errorDeclaration !== "string" ? errorDeclaration.docs : undefined,
        statusCode: errorDeclaration["status-code"],
        isWildcardStatusCode: undefined,
        type: errorDeclaration.type != null ? file.parseTypeReference(errorDeclaration.type) : undefined,
        examples,
        v2Examples: undefined,
        displayName: undefined,
        headers: []
    };
}
