import { fail } from "node:assert";
import { ast, text, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type ProtobufFile = FernIr.ProtobufFile;
type ProtobufService = FernIr.ProtobufService;
type ProtobufType = FernIr.ProtobufType;
type ServiceId = FernIr.ServiceId;
type TypeId = FernIr.TypeId;
type WellKnownProtobufType = FernIr.WellKnownProtobufType;
const WellKnownProtobufType = FernIr.WellKnownProtobufType;

import { GeneratorContext } from "../cli/index.js";
import { CsharpTypeMapper } from "../context/CsharpTypeMapper.js";
import { ResolvedWellKnownProtobufType } from "./ResolvedWellKnownProtobufType.js";

export class ProtobufResolver extends WithGeneration {
    private csharpTypeMapper: CsharpTypeMapper;

    public constructor(
        private readonly context: GeneratorContext,
        csharpTypeMapper: CsharpTypeMapper
    ) {
        super(context.generation);
        this.csharpTypeMapper = csharpTypeMapper;
    }

    public resolveWellKnownProtobufType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.generation.ir.types)) {
            if (this._isWellKnownProtobufType({ typeId, wellKnownProtobufTypes: [wellKnownProtobufType] })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType
                };
            }
        }
        return undefined;
    }

    public getProtobufClassReference(typeId: TypeId): ast.ClassReference {
        const protobufType =
            this.getProtobufTypeForTypeId(typeId) ?? fail(`The type identified by ${typeId} is not a Protobuf type`);
        switch (protobufType.type) {
            case "wellKnown": {
                return this.csharpTypeMapper.convertToClassReference(
                    this.model.dereferenceType(typeId).typeDeclaration
                );
            }
            case "userDefined": {
                const protoNamespace = this.context.protobufResolver.getNamespaceFromProtobufFile(protobufType.file);
                const aliasSuffix = text.camelCase(
                    protoNamespace
                        .split(".")
                        .filter((segment) => !this.namespaces.root.split(".").includes(segment))
                        .join("_")
                );
                return this.csharp.classReference({
                    name: protobufType.name.originalName,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFile(protobufType.file),
                    namespaceAlias: `Proto${aliasSuffix.charAt(0).toUpperCase()}${aliasSuffix.slice(1)}`
                });
            }
        }
    }

    public getProtobufServiceForServiceId(serviceId: ServiceId): ProtobufService | undefined {
        const transport = this.generation.ir.services[serviceId]?.transport;
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

    public getNamespaceFromProtobufFile(protobufFile: ProtobufFile): string {
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

    private getProtobufTypeForTypeId(typeId: TypeId): ProtobufType | undefined {
        const typeDeclaration = this.generation.ir.types[typeId];
        if (typeDeclaration?.source == null) {
            return undefined;
        }
        return typeDeclaration.source.type === "proto" ? typeDeclaration.source.value : undefined;
    }
}
