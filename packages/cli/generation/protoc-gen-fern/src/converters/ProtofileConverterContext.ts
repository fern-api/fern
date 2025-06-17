import { FileDescriptorProto } from "@bufbuild/protobuf/wkt";
import { OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext, Spec } from "@fern-api/v2-importer-commons";

import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";

/**
 * Context class for converting protobuf file descriptors to intermediate representations
 */
export class ProtofileConverterContext extends AbstractConverterContext<FileDescriptorProto> {
    public convertReferenceToTypeReference({
        reference
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        return { ok: false };
    }

    public convertGrpcReferenceToTypeReference({
        typeName,
        displayNameOverride
    }: {
        typeName: string;
        displayNameOverride?: string;
    }):
        | {
              ok: true;
              reference: TypeReference;
          }
        | { ok: false } {
        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: this.casingsGenerator.generateName(typeName),
                typeId: typeName,
                default: undefined,
                inline: false,
                displayName: displayNameOverride
            })
        };
    }

    public maybeRemoveGrpcPackagePrefix(typeName: string): string {
        const typeParts = typeName.split(".").filter((part) => part !== "");
        const packageParts = this.spec.package.split(".").filter((part) => part !== "");

        while (typeParts.length > 0 && packageParts.length > 0) {
            if (typeParts[0] !== packageParts[0]) {
                return typeName;
            }
            typeParts.shift();
            packageParts.shift();
        }

        if (typeParts.length === 0) {
            return typeName;
        }

        return typeParts.join(".");
    }

    public updateTypeId(
        type: EnumOrMessageConverter.ConvertedSchema,
        newTypeId: string
    ): EnumOrMessageConverter.ConvertedSchema {
        return {
            ...type,
            typeDeclaration: {
                ...type.typeDeclaration,
                name: {
                    ...type.typeDeclaration.name,
                    typeId: newTypeId
                }
            }
        };
    }
}
