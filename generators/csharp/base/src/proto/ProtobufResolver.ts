import { camelCase } from "lodash-es"

import { BaseCsharpCustomConfigSchema, csharp } from "@fern-api/csharp-codegen"

import {
    ProtobufFile,
    ProtobufService,
    ProtobufType,
    ServiceId,
    TypeId,
    WellKnownProtobufType
} from "@fern-fern/ir-sdk/api"

import { ResolvedWellKnownProtobufType } from "../ResolvedWellKnownProtobufType"
import { AbstractCsharpGeneratorContext } from "../context/AbstractCsharpGeneratorContext"
import { CsharpTypeMapper } from "../context/CsharpTypeMapper"

export class ProtobufResolver {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>
    private csharpTypeMapper: CsharpTypeMapper

    public constructor(
        context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>,
        csharpTypeMapper: CsharpTypeMapper
    ) {
        this.context = context
        this.csharpTypeMapper = csharpTypeMapper
    }

    public resolveWellKnownProtobufType(
        wellKnownProtobufType: WellKnownProtobufType
    ): ResolvedWellKnownProtobufType | undefined {
        for (const [typeId, typeDeclaration] of Object.entries(this.context.ir.types)) {
            if (this._isWellKnownProtobufType({ typeId, wellKnownProtobufTypes: [wellKnownProtobufType] })) {
                return {
                    typeDeclaration,
                    wellKnownProtobufType
                }
            }
        }
        return undefined
    }

    public getProtobufClassReferenceOrThrow(typeId: TypeId): csharp.ClassReference {
        const protobufType = this.getProtobufTypeForTypeIdOrThrow(typeId)
        switch (protobufType.type) {
            case "wellKnown": {
                return this.csharpTypeMapper.convertToClassReference(
                    this.context.getTypeDeclarationOrThrow(typeId).name
                )
            }
            case "userDefined": {
                const protoNamespace = this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(
                    protobufType.file
                )
                const rootNamespace = this.context.getNamespace()
                const aliasSuffix = camelCase(
                    protoNamespace
                        .split(".")
                        .filter((segment) => !rootNamespace.split(".").includes(segment))
                        .join("_")
                )
                return csharp.classReference({
                    name: protobufType.name.originalName,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufType.file),
                    namespaceAlias: `Proto${aliasSuffix.charAt(0).toUpperCase() + aliasSuffix.slice(1)}`
                })
            }
        }
    }

    public getProtobufServiceForServiceId(serviceId: ServiceId): ProtobufService | undefined {
        const transport = this.context.ir.services[serviceId]?.transport
        if (transport == null) {
            return undefined
        }
        switch (transport.type) {
            case "grpc":
                return transport.service
            case "http":
                return undefined
        }
    }

    public getNamespaceFromProtobufFileOrThrow(protobufFile: ProtobufFile): string {
        const namespace = protobufFile.options?.csharp?.namespace
        if (namespace == null) {
            throw new Error(
                `The 'csharp_namespace' file option must be declared in Protobuf file ${protobufFile.filepath}`
            )
        }
        return namespace
    }

    public isWellKnownProtobufType(typeId: TypeId): boolean {
        return this._isWellKnownProtobufType({
            typeId,
            wellKnownProtobufTypes: [
                WellKnownProtobufType.any(),
                WellKnownProtobufType.struct(),
                WellKnownProtobufType.value()
            ]
        })
    }

    public isWellKnownAnyProtobufType(typeId: TypeId): boolean {
        return this._isWellKnownProtobufType({
            typeId,
            wellKnownProtobufTypes: [WellKnownProtobufType.any()]
        })
    }

    private _isWellKnownProtobufType({
        typeId,
        wellKnownProtobufTypes
    }: {
        typeId: TypeId
        wellKnownProtobufTypes: WellKnownProtobufType[]
    }): boolean {
        const protobufType = this.getProtobufTypeForTypeId(typeId)
        return (
            protobufType?.type === "wellKnown" &&
            wellKnownProtobufTypes.some(
                (wellKnownProtobufType) => protobufType.value.type === wellKnownProtobufType.type
            )
        )
    }

    private getProtobufTypeForTypeIdOrThrow(typeId: TypeId): ProtobufType {
        const protobufType = this.getProtobufTypeForTypeId(typeId)
        if (protobufType == null) {
            throw new Error(`The type identified by ${typeId} is not a Protobuf type`)
        }
        return protobufType
    }

    private getProtobufTypeForTypeId(typeId: TypeId): ProtobufType | undefined {
        const typeDeclaration = this.context.ir.types[typeId]
        if (typeDeclaration?.source == null) {
            return undefined
        }
        return typeDeclaration.source.type === "proto" ? typeDeclaration.source.value : undefined
    }
}
