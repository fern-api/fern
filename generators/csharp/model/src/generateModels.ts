import { File } from "@fern-api/base-generator";
import { CSharpFile } from "@fern-api/csharp-base";

import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;

import { EnumGenerator } from "./enum/EnumGenerator.js";
import { StringEnumGenerator } from "./enum/StringEnumGenerator.js";
import { generateLiteralType } from "./generateLiteralType.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UndiscriminatedUnionGenerator } from "./undiscriminated-union/UndiscriminatedUnionGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export interface GenerateModelsResult {
    files: CSharpFile[];
    literalTypeFiles: File[];
}

export function generateModels({ context }: { context: ModelGeneratorContext }): GenerateModelsResult {
    const files: CSharpFile[] = [];
    const literalTypeFiles: File[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }
        if (context.protobufResolver.isExternalProtobufType(typeId)) {
            // External proto types (e.g. google.rpc.Status) are used directly
            // without generating a separate SDK wrapper type.
            continue;
        }
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: (aliasDeclaration) => {
                // Generate literal struct files for named literal alias types when generateLiterals is on.
                // One file per literal type as defined in the IR. The struct name comes from the IR type name.
                if (context.generation.settings.generateLiterals) {
                    const resolvedType = aliasDeclaration.resolvedType;
                    if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
                        const rawStructName = context.case.pascalSafe(typeDeclaration.name.name);
                        const namespace = context.getNamespaceForTypeId(typeId);
                        const directory = context.getDirectoryForTypeId(typeId);
                        // Register the name through the name registry so the raw file uses the
                        // same (possibly collision-resolved) name that ClassReference lookups will.
                        const registeredRef = context.csharp.classReference({
                            name: rawStructName,
                            namespace
                        });
                        const structName = registeredRef.name;
                        literalTypeFiles.push(
                            generateLiteralType({
                                structName,
                                literal: resolvedType.container.literal,
                                namespace: registeredRef.namespace,
                                directory
                            })
                        );
                    }
                }
                return undefined;
            },
            enum: (etd: EnumTypeDeclaration) => {
                return context.settings.isForwardCompatibleEnumsEnabled
                    ? new StringEnumGenerator(context, typeDeclaration, etd).generate()
                    : new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd) => {
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: (undiscriminatedUnionDeclaration) => {
                if (context.settings.shouldGenerateUndiscriminatedUnions) {
                    return new UndiscriminatedUnionGenerator(
                        context,
                        typeDeclaration,
                        undiscriminatedUnionDeclaration
                    ).generate();
                }
                return undefined;
            },
            union: (unionDeclaration) => {
                if (context.settings.shouldGeneratedDiscriminatedUnions) {
                    return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
                }
                return undefined;
            },
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return { files, literalTypeFiles };
}
