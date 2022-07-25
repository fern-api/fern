import { assertNever } from "@fern-api/core-utils";
import { TypeReference } from "@fern-fern/ir-model";
import { ModelServiceTypeReference } from "@fern-typescript/model-context/src/service-type-context/types";
import { SourceFile } from "ts-morph";
import { ServiceTypeName } from "./types";

export type ServiceTypeFileWriter<M> = (
    typeName: ServiceTypeName,
    withFile: (file: SourceFile, transformedTypeName: string) => void
) => M;

export declare namespace ServiceTypeFileWriter {
    export interface Args {
        file: SourceFile;
        typeName: ServiceTypeName;
    }
}

export declare namespace generateServiceTypeReference {
    export interface Args {
        typeReference: TypeReference;
    }
}

export function generateServiceTypeReference({
    typeReference,
}: generateServiceTypeReference.Args): ModelServiceTypeReference | undefined {
    switch (typeReference._type) {
        case "named":
        case "primitive":
        case "container":
        case "unknown":
            return {
                isInlined: false,
                typeReference,
            };
        case "void":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
