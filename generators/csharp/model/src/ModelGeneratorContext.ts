import { AbstractFormatter, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AsIsFiles, BaseCsharpGeneratorContext } from "@fern-api/csharp-base";
import { CsharpGeneratorContext } from "@fern-api/csharp-codegen";
import { CsharpFormatter } from "@fern-api/csharp-formatter";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { FernFilepath, IntermediateRepresentation, TypeId, WellKnownProtobufType } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends BaseCsharpGeneratorContext<ModelCustomConfigSchema> {
    public readonly formatter: AbstractFormatter;
    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(
            ir,
            config,
            customConfig,
            generatorNotificationService,
            new CsharpGeneratorContext(ir, config, customConfig, {
                makeRelativeFilePath: (path: string) => RelativeFilePath.of(path),
                makeAbsoluteFilePath: (path: string) => AbsoluteFilePath.of(path),
                getNamespaceForTypeId: (typeId: TypeId) => this.getNamespaceForTypeId(typeId),
                getDirectoryForTypeId: (typeId: TypeId) => this.getDirectoryForTypeId(typeId),
                getCoreAsIsFiles: () => this.getCoreAsIsFiles(),
                getCoreTestAsIsFiles: () => this.getCoreTestAsIsFiles(),
                getPublicCoreAsIsFiles: () => this.getPublicCoreAsIsFiles(),
                getAsyncCoreAsIsFiles: () => [],
                getChildNamespaceSegments: (fernFilepath: FernFilepath) => this.getChildNamespaceSegments(fernFilepath)
            })
        );
        this.formatter = new CsharpFormatter();
    }

    public get generation() {
        return this.common.generation;
    }
    public get namespaces() {
        return this.generation.namespaces;
    }
    public get registry() {
        return this.generation.registry;
    }
    public get extern() {
        return this.generation.extern;
    }
    public get settings() {
        return this.generation.settings;
    }
    public get constants() {
        return this.generation.constants;
    }
    public get names() {
        return this.generation.names;
    }
    public get types() {
        return this.generation.types;
    }
    public get model() {
        return this.generation.model;
    }
    public get csharp() {
        return this.generation.csharp;
    }
    public get System() {
        return this.extern.System;
    }
    public get NUnit() {
        return this.extern.NUnit;
    }
    public get OneOf() {
        return this.extern.OneOf;
    }
    public get Google() {
        return this.extern.Google;
    }

    /**
     * __package__.yml types are stored at the top level
     * __{{file}}__.yml types are stored in a directory with the same name as the file
     *
     * @param typeId The type id of the type declaration
     * @returns
     */
    public getDirectoryForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        return RelativeFilePath.of(
            [...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        return [
            this.namespaces.root,
            ...typeDeclaration.name.fernFilepath.packagePath.map((path) => path.pascalCase.safeName)
        ].join(".");
    }

    public getCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.Constants];

        // JSON stuff
        files.push(
            ...[
                AsIsFiles.Json.CollectionItemSerializer,
                AsIsFiles.Json.DateOnlyConverter,
                AsIsFiles.Json.DateTimeSerializer,
                AsIsFiles.Json.JsonAccessAttribute,
                AsIsFiles.Json.JsonConfiguration,
                AsIsFiles.Json.OneOfSerializer
            ]
        );

        if (this.settings.isForwardCompatibleEnumsEnabled) {
            files.push(AsIsFiles.Json.StringEnumSerializer);
            files.push(AsIsFiles.StringEnum);
            files.push(AsIsFiles.StringEnumExtensions);
        } else {
            files.push(AsIsFiles.Json.EnumSerializer);
        }

        const resolvedProtoAnyType = this.common.protobufResolver.resolveWellKnownProtobufType(
            WellKnownProtobufType.any()
        );
        if (resolvedProtoAnyType != null) {
            files.push(AsIsFiles.ProtoAnyMapper);
        }
        return files;
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [
            AsIsFiles.Test.Json.DateOnlyJsonTests,
            AsIsFiles.Test.Json.DateTimeJsonTests,
            AsIsFiles.Test.Json.JsonAccessAttributeTests,
            AsIsFiles.Test.Json.OneOfSerializerTests
        ];
        if (this.settings.generateNewAdditionalProperties) {
            files.push(AsIsFiles.Test.Json.AdditionalPropertiesTests);
        }
        if (this.settings.isForwardCompatibleEnumsEnabled) {
            files.push(AsIsFiles.Test.Json.StringEnumSerializerTests);
        } else {
            files.push(AsIsFiles.Test.Json.EnumSerializerTests);
        }

        return files;
    }

    public getPublicCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.FileParameter];
        if (this.settings.generateNewAdditionalProperties) {
            files.push(AsIsFiles.Json.AdditionalProperties);
        }
        return files;
    }

    getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return fernFilepath.packagePath.map((segmentName) => segmentName.pascalCase.safeName);
    }

    public override shouldCreateCustomPagination(): boolean {
        return false;
    }
}
