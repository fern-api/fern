import {
    AbstractFormatter,
    CaseConverter,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/base-generator";
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
        const caseConverter = new CaseConverter({
            generationLanguage: "csharp",
            keywords: ir.casingsConfig?.keywords,
            smartCasing: ir.casingsConfig?.smartCasing ?? true
        });
        super(
            ir,
            config,
            customConfig,
            generatorNotificationService,
            new Generation(ir, caseConverter.pascalUnsafe(ir.apiName), customConfig, config, {
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
            [...typeDeclaration.name.fernFilepath.allParts.map((path) => this.case.pascalSafe(path))].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        return [
            this.namespaces.root,
            ...typeDeclaration.name.fernFilepath.packagePath.map((path) => this.case.pascalSafe(path))
        ].join(".");
    }

    public getCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.Constants];

        // JSON stuff
        files.push(
            ...[
                AsIsFiles.Json.DateOnlyConverter,
                AsIsFiles.Json.DateTimeSerializer,
                AsIsFiles.Json.JsonAccessAttribute,
                AsIsFiles.Json.JsonConfiguration,
                AsIsFiles.Json.Nullable,
                AsIsFiles.Json.Optional,
                AsIsFiles.Json.OptionalAttribute
            ]
        );

        // When use-undiscriminated-unions is false, include OneOf serialization support
        if (!this.settings.shouldGenerateUndiscriminatedUnions) {
            files.push(AsIsFiles.Json.CollectionItemSerializer);
            files.push(AsIsFiles.Json.OneOfSerializer);
        }

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
            AsIsFiles.Test.Json.JsonAccessAttributeTests
        ];

        // Only include OneOfSerializerTests when OneOf serialization is in use
        if (!this.settings.shouldGenerateUndiscriminatedUnions) {
            files.push(AsIsFiles.Test.Json.OneOfSerializerTests);
        }

        return files;
    }

    public getPublicCoreAsIsFiles(): string[] {
        return [AsIsFiles.FileParameter, AsIsFiles.Json.AdditionalProperties];
    }

    public override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return fernFilepath.packagePath.map((segmentName) => this.case.pascalSafe(segmentName));
    }

    public override shouldCreateCustomPagination(): boolean {
        return false;
    }
}
