import { FileDescriptorProto } from "@bufbuild/protobuf/wkt";
import { OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext, Spec } from "@fern-api/v2-importer-commons";

import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";
import { CommentNode, PathStarterValues } from "./utils/CreateGlobalCommentsStore";
import { SOURCE_CODE_INFO_PATH_STARTERS } from "./utils/PathFieldNumbers";

export declare namespace ProtofileConverterContext {
    export interface Args extends Spec.Args<FileDescriptorProto> {
        comments: Record<PathStarterValues, CommentNode>;
    }
}

/**
 * Context class for converting protobuf file descriptors to intermediate representations
 */
export class ProtofileConverterContext extends AbstractConverterContext<FileDescriptorProto> {
    private readonly comments: Record<PathStarterValues, CommentNode>;

    constructor({ comments, ...rest }: ProtofileConverterContext.Args) {
        super(rest);
        this.comments = comments;
    }

    public maybePrependPackageName(name: string): string {
        if (this.maybeRemoveLeadingPeriod(name).startsWith(this.spec.package)) {
            return name;
        }
        return this.spec.package + "." + name;
    }

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
                name: this.casingsGenerator.generateName(this.maybeRemoveLeadingPeriod(typeName)),
                typeId: this.maybeRemoveLeadingPeriod(typeName),
                default: undefined,
                inline: false,
                displayName: displayNameOverride
            })
        };
    }

    public maybeRemoveLeadingPeriod(typeName: string): string {
        if (typeName.startsWith(".")) {
            return typeName.slice(1);
        }
        return typeName;
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

    public getCommentForPath(path: number[]): string | undefined {
        if (!path || path.length === 0) {
            return undefined;
        }

        const startValue = path[0] as PathStarterValues;
        if (!(startValue in this.comments)) {
            return undefined;
        }

        let current: CommentNode | undefined = this.comments[startValue];

        // Navigate through the path
        for (let i = 1; i < path.length; i++) {
            const key = path[i];

            if (key === undefined || !current) {
                return undefined;
            }

            current = current[key];
        }

        // Return the comment stored at this node
        return current?._comment;
    }
}
