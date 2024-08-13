import { TypeDeclaration, WellKnownProtobufType } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ResolvedWellKnownProtoType } from "./ResolvedWellKnownProtoType";

export declare namespace WellKnownProtoTypeResolver {
    interface Args {
        context: SdkGeneratorContext;
    }
}

export class WellKnownProtoTypeResolver {
    private context: SdkGeneratorContext;

    constructor({ context }: WellKnownProtoTypeResolver.Args) {
        this.context = context;
    }

    public resolveWellKnownProtoTypeOrThrow(wellKnownProtobufType: WellKnownProtobufType): ResolvedWellKnownProtoType {
        const resolvedWellKnownProtoType = this.resolveWellKnownProtoType(wellKnownProtobufType);
        if (resolvedWellKnownProtoType === undefined) {
            throw new Error(`Well-known Protobuf type "${wellKnownProtobufType.type}" could not be found.`);
        }
        return resolvedWellKnownProtoType;
    }

    public resolveWellKnownProtoType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtoType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.context.ir.types)) {
            if (this.isWellKnownProtoType({ typeDeclaration, wellKnownProtobufType })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType: wellKnownProtobufType
                };
            }
        }
        return undefined;
    }

    private isWellKnownProtoType({
        typeDeclaration,
        wellKnownProtobufType
    }: {
        typeDeclaration: TypeDeclaration;
        wellKnownProtobufType: WellKnownProtobufType;
    }): boolean {
        const protobufType = this.context.getProtobufTypeForTypeId(typeDeclaration.name.typeId);
        if (protobufType == null) {
            return false;
        }
        return protobufType.type === "wellKnown" && protobufType.value.type === wellKnownProtobufType.type;
    }
}
