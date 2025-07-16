import { AbstractFormatter, FernGeneratorExec, GeneratorNotificationService } from '@fern-api/base-generator'
import { AbstractCsharpGeneratorContext, AsIsFiles } from '@fern-api/csharp-base'
import { CsharpFormatter } from '@fern-api/csharp-formatter'
import { RelativeFilePath } from '@fern-api/fs-utils'

import { FernFilepath, IntermediateRepresentation, TypeId, WellKnownProtobufType } from '@fern-fern/ir-sdk/api'

import { ModelCustomConfigSchema } from './ModelCustomConfig'

export class ModelGeneratorContext extends AbstractCsharpGeneratorContext<ModelCustomConfigSchema> {
    public readonly formatter: AbstractFormatter
    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService)
        this.formatter = new CsharpFormatter()
    }

    /**
     * __package__.yml types are stored at the top level
     * __{{file}}__.yml types are stored in a directory with the same name as the file
     *
     * @param typeId The type id of the type declaration
     * @returns
     */
    public getDirectoryForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId)
        return RelativeFilePath.of(
            [...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join('/')
        )
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId)
        return [
            this.getNamespace(),
            ...typeDeclaration.name.fernFilepath.packagePath.map((path) => path.pascalCase.safeName)
        ].join('.')
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.EditorConfig, AsIsFiles.GitIgnore]
    }

    public getCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.Constants]

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
        )

        if (this.isForwardCompatibleEnumsEnabled()) {
            files.push(AsIsFiles.Json.StringEnumSerializer)
            files.push(AsIsFiles.StringEnum)
            files.push(AsIsFiles.StringEnumExtensions)
        } else {
            files.push(AsIsFiles.Json.EnumSerializer)
        }

        const resolvedProtoAnyType = this.protobufResolver.resolveWellKnownProtobufType(WellKnownProtobufType.any())
        if (resolvedProtoAnyType != null) {
            files.push(AsIsFiles.ProtoAnyMapper)
        }
        return files
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [
            AsIsFiles.Test.Json.DateOnlyJsonTests,
            AsIsFiles.Test.Json.DateTimeJsonTests,
            AsIsFiles.Test.Json.JsonAccessAttributeTests,
            AsIsFiles.Test.Json.OneOfSerializerTests
        ]
        if (this.generateNewAdditionalProperties()) {
            files.push(AsIsFiles.Test.Json.AdditionalPropertiesTests)
        }
        if (this.isForwardCompatibleEnumsEnabled()) {
            files.push(AsIsFiles.Test.Json.StringEnumSerializerTests)
        } else {
            files.push(AsIsFiles.Test.Json.EnumSerializerTests)
        }

        return files
    }

    public getPublicCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.FileParameter]
        if (this.generateNewAdditionalProperties()) {
            files.push(AsIsFiles.Json.AdditionalProperties)
        }
        return files
    }

    public getPublicCoreTestAsIsFiles(): string[] {
        return []
    }

    public getAsIsTestUtils(): string[] {
        return Object.values(AsIsFiles.Test.Utils)
    }

    public getExtraDependencies(): Record<string, string> {
        return {}
    }

    override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return fernFilepath.packagePath.map((segmentName) => segmentName.pascalCase.safeName)
    }

    public shouldCreateCustomPagination(): boolean {
        return false
    }
}
