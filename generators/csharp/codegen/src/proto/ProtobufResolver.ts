import {
    ProtobufFile,
    ProtobufService,
    ProtobufType,
    ServiceId,
    TypeId,
    WellKnownProtobufType
} from "@fern-fern/ir-sdk/api";
import { ast } from "../";
import { CsharpGeneratorContext } from "../context/CsharpGeneratorContext";
import { CsharpTypeMapper } from "../context/CsharpTypeMapper";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { camelCase } from "../utils/text";
import { WithGeneration } from "../with-generation";
import { ResolvedWellKnownProtobufType } from "./ResolvedWellKnownProtobufType";

export class ProtobufResolver extends WithGeneration {
    private csharpTypeMapper: CsharpTypeMapper;

    public constructor(
        private readonly context: CsharpGeneratorContext<BaseCsharpCustomConfigSchema>,
        csharpTypeMapper: CsharpTypeMapper
    ) {
        super(context);
        this.csharpTypeMapper = csharpTypeMapper;
    }

    public resolveWellKnownProtobufType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.context.ir.types)) {
            if (this._isWellKnownProtobufType({ typeId, wellKnownProtobufTypes: [wellKnownProtobufType] })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType
                };
            }
        }
        return undefined;
    }

    public getProtobufClassReferenceOrThrow(typeId: TypeId): ast.ClassReference {
        const protobufType = this.getProtobufTypeForTypeIdOrThrow(typeId);
        switch (protobufType.type) {
            case "wellKnown": {
                return this.csharpTypeMapper.convertToClassReference(
                    this.model.dereferenceType(typeId).typeDeclaration
                );
            }
            case "userDefined": {
                const protoNamespace = this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(
                    protobufType.file
                );
                const aliasSuffix = camelCase(
                    protoNamespace
                        .split(".")
                        .filter((segment) => !this.namespaces.root.split(".").includes(segment))
                        .join("_")
                );
                return this.csharp.classReference({
                    name: protobufType.name.originalName,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufType.file),
                    namespaceAlias: `Proto${aliasSuffix.charAt(0).toUpperCase()}${aliasSuffix.slice(1)}`
                });
            }
        }
    }

    public getProtobufServiceForServiceId(serviceId: ServiceId): ProtobufService | undefined {
        const transport = this.context.ir.services[serviceId]?.transport;
        if (transport == null) {
            return undefined;
        }
        switch (transport.type) {
            case "grpc":
                return transport.service;
            case "http":
                return undefined;
        }
    }

    public getNamespaceFromProtobufFileOrThrow(protobufFile: ProtobufFile): string {
        const namespace = protobufFile.options?.csharp?.namespace;
        if (namespace == null) {
            throw new Error(
                `The 'csharp_namespace' file option must be declared in Protobuf file ${protobufFile.filepath}`
            );
        }
        return namespace;
    }

    public isWellKnownProtobufType(typeId: TypeId): boolean {
        return this._isWellKnownProtobufType({
            typeId,
            wellKnownProtobufTypes: [
                WellKnownProtobufType.any(),
                WellKnownProtobufType.struct(),
                WellKnownProtobufType.value()
            ]
        });
    }

    public isWellKnownAnyProtobufType(typeId: TypeId): boolean {
        return this._isWellKnownProtobufType({
            typeId,
            wellKnownProtobufTypes: [WellKnownProtobufType.any()]
        });
    }

    private _isWellKnownProtobufType({
        typeId,
        wellKnownProtobufTypes
    }: {
        typeId: TypeId;
        wellKnownProtobufTypes: WellKnownProtobufType[];
    }): boolean {
        const protobufType = this.getProtobufTypeForTypeId(typeId);
        return (
            protobufType?.type === "wellKnown" &&
            wellKnownProtobufTypes.some(
                (wellKnownProtobufType) => protobufType.value.type === wellKnownProtobufType.type
            )
        );
    }

    private getProtobufTypeForTypeIdOrThrow(typeId: TypeId): ProtobufType {
        const protobufType = this.getProtobufTypeForTypeId(typeId);
        if (protobufType == null) {
            throw new Error(`The type identified by ${typeId} is not a Protobuf type`);
        }
        return protobufType;
    }

    private getProtobufTypeForTypeId(typeId: TypeId): ProtobufType | undefined {
        const typeDeclaration = this.context.ir.types[typeId];
        if (typeDeclaration?.source == null) {
            return undefined;
        }
        return typeDeclaration.source.type === "proto" ? typeDeclaration.source.value : undefined;
    }
}
