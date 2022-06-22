import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { ModelContext, ServiceTypeReference } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";
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
    export interface Args<M> {
        typeName: ServiceTypeName;
        writer: ServiceTypeFileWriter<M>;
        type: Type;
        docs: string | null | undefined;
        modelContext: ModelContext;
    }
}

export function generateServiceTypeReference<M>({
    typeName,
    writer,
    type,
    docs,
    modelContext,
}: generateServiceTypeReference.Args<M>): ServiceTypeReference<M> | undefined {
    if (type._type === "alias") {
        switch (type.aliasOf._type) {
            case "named":
            case "primitive":
            case "container":
            case "unknown":
                return {
                    isInlined: false,
                    typeReference: type.aliasOf,
                };
            case "void":
                return undefined;
            default:
                assertNever(type.aliasOf);
        }
    }

    const metadata = writer(typeName, (file, transformedTypeName) => {
        generateType({
            type,
            docs,
            typeName: transformedTypeName,
            modelContext,
            file,
        });
    });

    return {
        isInlined: true,
        metadata,
    };
}
