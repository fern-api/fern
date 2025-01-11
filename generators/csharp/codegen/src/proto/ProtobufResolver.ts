import {
    ProtobufFile,
    ProtobufService,
    ProtobufType,
    ServiceId,
    TypeId,
    WellKnownProtobufType
} from "@fern-fern/ir-sdk/api";

import { csharp } from "..";
import { ResolvedWellKnownProtobufType } from "../ResolvedWellKnownProtobufType";
import { AbstractCsharpGeneratorContext } from "../context/AbstractCsharpGeneratorContext";
import { CsharpTypeMapper } from "../context/CsharpTypeMapper";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";

export class ProtobufResolver {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;
    private csharpTypeMapper: CsharpTypeMapper;

    public constructor(
        context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>,
        csharpTypeMapper: CsharpTypeMapper
    ) {
        this.context = context;
        this.csharpTypeMapper = csharpTypeMapper;
    }

    public resolveWellKnownProtobufType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.context.ir.types)) {
            if (this.isWellKnownProtobufType({ typeId, wellKnownProtobufTypes: [wellKnownProtobufType] })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType
                };
            }
        }
        return undefined;
    }

    public getProtobufClassReferenceOrThrow(typeId: TypeId): csharp.ClassReference {
        const protobufType = this.getProtobufTypeForTypeIdOrThrow(typeId);
        switch (protobufType.type) {
            case "wellKnown": {
                return this.csharpTypeMapper.convertToClassReference(
                    this.context.getTypeDeclarationOrThrow(typeId).name
                );
            }
            case "userDefined": {
                return new csharp.ClassReference({
                    name: this.context.getPascalCaseSafeName(protobufType.name),
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufType.file),
                    namespaceAlias: "Proto"
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

    public isAnyWellKnownProtobufType(typeId: TypeId): boolean {
        return this.isWellKnownProtobufType({
            typeId,
            wellKnownProtobufTypes: [WellKnownProtobufType.struct(), WellKnownProtobufType.value()]
        });
    }

    private isWellKnownProtobufType({
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
