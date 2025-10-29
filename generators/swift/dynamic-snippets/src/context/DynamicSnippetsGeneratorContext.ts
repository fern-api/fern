import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { assertDefined, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseSwiftCustomConfigSchema, NameRegistry, swift } from "@fern-api/swift-codegen";
import { pascalCase } from "../util/pascal-case";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";
import { registerDiscriminatedUnionVariants } from "./register-discriminated-unions";
import { registerLiteralEnums } from "./register-literal-enums";
import { registerUndiscriminatedUnionVariants } from "./register-undiscriminated-unions";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseSwiftCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    // TODO(kafkas): Implement
    public nameRegistry: NameRegistry;

    public constructor({
        ir,
        config,
        options
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
    }) {
        super({ ir: ir, config, options });
        this.ir = ir;
        this.customConfig =
            config.customConfig != null ? (config.customConfig as BaseSwiftCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
        this.nameRegistry = this.initRegistry(ir);
    }

    private initRegistry(ir: FernIr.dynamic.DynamicIntermediateRepresentation) {
        const nameRegistry = NameRegistry.create();
        const apiNamePascalCase = pascalCase(this.config.workspaceName);
        nameRegistry.registerSourceModuleSymbol({
            configModuleName: this.customConfig?.moduleName,
            apiNamePascalCase,
            asIsSymbols: Object.values(swift.SourceAsIsFileSpecs).flatMap(
                (spec: swift.AsIsFileSpec<swift.AsIsSymbolName>) => spec.symbols
            )
        });
        nameRegistry.registerRootClientSymbol({
            configClientClassName: this.customConfig?.clientClassName,
            apiNamePascalCase
        });
        nameRegistry.registerEnvironmentSymbol({
            configEnvironmentEnumName: this.customConfig?.environmentEnumName,
            apiNamePascalCase: apiNamePascalCase
        });

        // Must first register top-level symbols
        const registeredSchemaTypes = Object.entries(ir.types).map(([typeId, namedType]) => {
            const symbolShape = visitDiscriminatedUnion(namedType, "type")._visit<swift.TypeSymbolShape>({
                alias: () => ({ type: "struct" }),
                enum: () => ({ type: "enum-with-raw-values" }),
                object: () => ({ type: "struct" }),
                discriminatedUnion: () => ({ type: "enum-with-associated-values" }),
                undiscriminatedUnion: () => ({ type: "enum-with-associated-values" }),
                _other: () => ({ type: "other" })
            });
            const schemaTypeSymbol = nameRegistry.registerSchemaTypeSymbol(
                typeId,
                namedType.declaration.name.pascalCase.unsafeName,
                symbolShape
            );
            return { namedType, registeredSymbol: schemaTypeSymbol };
        });

        registeredSchemaTypes.forEach(({ namedType, registeredSymbol }) => {
            registerDiscriminatedUnionVariants({
                parentSymbol: registeredSymbol,
                registry: nameRegistry,
                namedType
            });
            registerLiteralEnums({
                parentSymbol: registeredSymbol,
                registry: nameRegistry,
                namedType,
                context: this
            });
            registerUndiscriminatedUnionVariants({
                parentSymbol: registeredSymbol,
                registry: nameRegistry,
                namedType,
                context: this
            });
        });

        // TODO(kafkas): Implement

        return nameRegistry;
    }

    public getNamedTypeOrThrow(typeId: string): FernIr.dynamic.NamedType {
        const namedType = this.ir.types[typeId];
        assertDefined(namedType, `Type declaration with the id '${typeId}' not found`);
        return namedType;
    }

    public getPropertiesOfDiscriminatedUnionVariant(typeId: string): FernIr.dynamic.NamedParameter[] {
        const namedType = this.getNamedTypeOrThrow(typeId);
        return visitDiscriminatedUnion(namedType, "type")._visit({
            alias: () => [],
            enum: () => [],
            object: (otd) => otd.properties,
            discriminatedUnion: () => [],
            undiscriminatedUnion: () => [],
            _other: () => []
        });
    }

    public getSwiftTypeReferenceFromScope(
        typeReference: FernIr.dynamic.TypeReference,
        fromSymbol: swift.Symbol | string
    ): swift.TypeReference {
        // TODO(kafkas): Implement
        throw new Error("Not implemented");
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }
}
