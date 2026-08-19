import { fail } from "node:assert";
import { getOriginalName } from "@fern-api/base-generator";
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
                // Nested proto types use underscore-separated names (e.g. "InvoiceBundle_Status")
                // from protoc-gen-openapi. In C# protobuf codegen, nested types are
                // accessed as "ParentMessage.Types.NestedType".
                const originalName = getOriginalName(protobufType.name);
                const protoClassName = originalName.includes("_")
                    ? originalName.split("_").join(".Types.")
                    : originalName;
                return this.csharp.classReference({
                    name: protoClassName,
                    namespace: protoNamespace,
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

    /**
     * Returns true if the type is an external proto type (e.g. google.rpc.Status)
     * that should be surfaced directly in the SDK without generating a wrapper type.
     */
    public isExternalProtobufType(typeId: TypeId): boolean {
        const protobufType = this.getProtobufTypeForTypeId(typeId);
        if (protobufType?.type === "userDefined") {
            const packageName = protobufType.file.packageName;
            if (packageName != null && EXTERNAL_PROTO_PACKAGES.has(packageName)) {
                return true;
            }
        }
        // Fallback: match on the type's declared name for cases where
        // proto source may not be fully resolved.
        const typeDeclaration = this.generation.ir.types[typeId];
        const nameOrString = typeDeclaration?.name?.name;
        const typeName = nameOrString != null ? getOriginalName(nameOrString) : undefined;
        return typeName != null && EXTERNAL_PROTO_TYPE_NAMES.has(typeName);
    }

    /**
     * Returns the class reference for an external proto type, using
     * known mappings to resolve the correct namespace and type name.
     */
    public getExternalProtobufClassReference(typeId: TypeId): ast.ClassReference {
        const typeDeclaration = this.generation.ir.types[typeId];
        const nameOrString = typeDeclaration?.name?.name;
        const typeName = nameOrString != null ? getOriginalName(nameOrString) : undefined;
        const mapping = EXTERNAL_PROTO_TYPE_CLASS_REFERENCES[typeName ?? ""];
        if (mapping != null) {
            return this.csharp.classReference({
                name: mapping.name,
                namespace: mapping.namespace
            });
        }
        // Fall back to the proto source if no known mapping exists.
        return this.getProtobufClassReference(typeId);
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

/**
 * Proto packages whose types should be surfaced directly in the SDK
 * (using the proto-generated class) without generating a separate wrapper type.
 */
const EXTERNAL_PROTO_PACKAGES = new Set(["google.rpc"]);

/**
 * Type names that correspond to external proto types. Used as a fallback
 * when proto source info may not be fully resolved (e.g. from OpenAPI imports).
 */
const EXTERNAL_PROTO_TYPE_NAMES = new Set(["GoogleRpcStatus"]);

/**
 * Known external proto type class references, keyed by IR type name.
 */
const EXTERNAL_PROTO_TYPE_CLASS_REFERENCES: Record<string, { name: string; namespace: string }> = {
    GoogleRpcStatus: { name: "Status", namespace: "Google.Rpc" }
};
