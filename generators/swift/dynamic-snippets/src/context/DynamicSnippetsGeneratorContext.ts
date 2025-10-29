import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { assertDefined, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseSwiftCustomConfigSchema, NameRegistry, Referencer, swift } from "@fern-api/swift-codegen";
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
        typeReference;
        const referencer = this.createReferencer(fromSymbol);
        return visitDiscriminatedUnion(typeReference, "type")._visit({
            list: (ref) => swift.TypeReference.array(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
            literal: (ref) => {
                return visitDiscriminatedUnion(ref.value, "type")._visit({
                    boolean: () => referencer.referenceAsIsType("JSONValue"),
                    string: (literalType) => {
                        const symbol = this.nameRegistry.getNestedLiteralEnumSymbolOrThrow(
                            fromSymbol,
                            literalType.value
                        );
                        return referencer.referenceType(symbol);
                    },
                    _other: () => referencer.referenceAsIsType("JSONValue")
                });
            },
            map: (ref) =>
                swift.TypeReference.dictionary(
                    this.getSwiftTypeReferenceFromScope(ref.key, fromSymbol),
                    this.getSwiftTypeReferenceFromScope(ref.value, fromSymbol)
                ),
            named: (ref) => {
                const toSymbol = this.nameRegistry.getSchemaTypeSymbolOrThrow(ref.value);
                const symbolRef = this.nameRegistry.reference({ fromSymbol, toSymbol });
                return swift.TypeReference.symbol(symbolRef);
            },
            nullable: (ref) => swift.TypeReference.nullable(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
            optional: (ref) => swift.TypeReference.optional(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
            primitive: (ref) => {
                return visitDiscriminatedUnion(ref, "value")._visit({
                    STRING: () => referencer.referenceSwiftType("String"),
                    BOOLEAN: () => referencer.referenceSwiftType("Bool"),
                    INTEGER: () => referencer.referenceSwiftType("Int"),
                    UINT: () => referencer.referenceSwiftType("UInt"),
                    UINT_64: () => referencer.referenceSwiftType("UInt64"),
                    LONG: () => referencer.referenceSwiftType("Int64"),
                    FLOAT: () => referencer.referenceSwiftType("Float"),
                    DOUBLE: () => referencer.referenceSwiftType("Double"),
                    BIG_INTEGER: () => referencer.referenceSwiftType("String"),
                    DATE: () => referencer.referenceAsIsType("CalendarDate"),
                    DATE_TIME: () => referencer.referenceFoundationType("Date"),
                    BASE_64: () => referencer.referenceSwiftType("String"),
                    UUID: () => referencer.referenceFoundationType("UUID"),
                    _other: () => referencer.referenceAsIsType("JSONValue")
                });
            },
            set: () => referencer.referenceAsIsType("JSONValue"),
            unknown: () => referencer.referenceAsIsType("JSONValue"),
            _other: () => referencer.referenceAsIsType("JSONValue")
        });
    }

    public createReferencer(fromSymbol: swift.Symbol | string) {
        return new Referencer(this.nameRegistry, fromSymbol);
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }
}
