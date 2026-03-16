import { AbstractFormatter, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AsIsFiles, GeneratorContext } from "@fern-api/csharp-base";
import { CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { CsharpFormatter } from "@fern-api/csharp-formatter";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

type FernFilepath = FernIr.FernFilepath;
type IntermediateRepresentation = FernIr.IntermediateRepresentation;
type TypeId = FernIr.TypeId;
type WellKnownProtobufType = FernIr.WellKnownProtobufType;
const WellKnownProtobufType = FernIr.WellKnownProtobufType;

export class ModelGeneratorContext extends GeneratorContext {
    /**
     * Lazily initializes the CsharpFormatter on first access.
     * The formatter resolves the csharpier tool path and is only needed
     * during code formatting, not during context construction.
     */
    public get formatter(): AbstractFormatter {
        if (this._formatter === undefined) {
            this._formatter = new CsharpFormatter();
        }
        return this._formatter;
    }

    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CsharpConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(
            ir,
            config,
            customConfig,
            generatorNotificationService,
            new Generation(ir, ir.apiName.pascalCase.unsafeName, customConfig, config, {
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
    }

    override getAsyncCoreAsIsFiles(): string[] {
        return [];
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
                AsIsFiles.Json.Nullable,
                AsIsFiles.Json.OneOfSerializer,
                AsIsFiles.Json.Optional,
                AsIsFiles.Json.OptionalAttribute
            ]
        );

        if (this.settings.isForwardCompatibleEnumsEnabled) {
            files.push(AsIsFiles.StringEnum);
            files.push(AsIsFiles.StringEnumExtensions);
        }

        const resolvedProtoAnyType = this.protobufResolver.resolveWellKnownProtobufType(WellKnownProtobufType.any());
        if (resolvedProtoAnyType != null) {
            files.push(AsIsFiles.ProtoAnyMapper);
        }
        return files;
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [
            AsIsFiles.Test.Json.AdditionalPropertiesTests,
            AsIsFiles.Test.Json.DateOnlyJsonTests,
            AsIsFiles.Test.Json.DateTimeJsonTests,
            AsIsFiles.Test.Json.JsonAccessAttributeTests,
            AsIsFiles.Test.Json.OneOfSerializerTests
        ];

        return files;
    }

    public getPublicCoreAsIsFiles(): string[] {
        return [AsIsFiles.FileParameter, AsIsFiles.Json.AdditionalProperties];
    }

    public override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return fernFilepath.packagePath.map((segmentName) => segmentName.pascalCase.safeName);
    }

    public override shouldCreateCustomPagination(): boolean {
        return false;
    }
}
