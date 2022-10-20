import { DeclaredTypeName, EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "../AbstractSchemaGenerator";
import { AbstractTypeSchemaGenerator } from "../AbstractTypeSchemaGenerator";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumConst } from "./EnumConst";
import { EnumInterface } from "./EnumInterface";
import { EnumModule } from "./EnumModule";
import { EnumSchema } from "./EnumSchema";
import { EnumVisitHelper } from "./EnumVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export declare namespace EnumTypeGenerator {
    export interface Init {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        shape: EnumTypeDeclaration;
    }
}

export class EnumTypeGenerator extends AbstractTypeSchemaGenerator {
    private parsedEnumValues: ParsedEnumValue[];
    private enumInterface: EnumInterface;
    private enumConst: EnumConst;
    private enumModule: EnumModule;
    private enumSchema: EnumSchema;
    private visitHelper: EnumVisitHelper;
    private declaredTypeName: DeclaredTypeName;

    constructor({ typeName, typeDeclaration, shape }: EnumTypeGenerator.Init) {
        super({ typeName });
        this.declaredTypeName = typeDeclaration.name;

        const parsedEnumValues = shape.values.map((enumValue) => new ParsedEnumValue({ enumValue }));

        const enumFileDeclarationInit: AbstractEnumFileDeclaration.Init = {
            enum_: shape,
            typeDeclaration,
            typeName,
            parsedEnumValues,
        };

        this.parsedEnumValues = parsedEnumValues;
        this.enumInterface = new EnumInterface(enumFileDeclarationInit);
        this.enumConst = new EnumConst(enumFileDeclarationInit);
        this.enumModule = new EnumModule(enumFileDeclarationInit);
        this.enumSchema = new EnumSchema(enumFileDeclarationInit);
        this.visitHelper = new EnumVisitHelper({ parsedEnumValues });
    }

    public generate({ typeFile, schemaFile }: { typeFile: SdkFile; schemaFile: SdkFile }): void {
        this.enumInterface.writeToFile(typeFile, this.enumModule);
        for (const parsedEnumValue of this.parsedEnumValues) {
            typeFile.sourceFile.addVariableStatement(parsedEnumValue.getBuiltObjectDeclaration(this.enumInterface));
        }
        this.enumConst.writeToFile({
            file: typeFile,
            enumInterface: this.enumInterface,
            enumModule: this.enumModule,
        });
        this.enumModule.writeToFile(typeFile, this.visitHelper);
        this.writeSchemaToFile(schemaFile);
    }

    public static getReferenceToRawValueType({ referenceToModule }: { referenceToModule: ts.EntityName }): ts.TypeNode {
        return EnumModule.getReferenceToRawValue({ referenceToModule });
    }

    public static getReferenceToRawValue(referenceToEnum: ts.Expression): ts.Expression {
        return EnumInterface.getReferenceToRawValue(referenceToEnum);
    }

    protected override generateRawTypeDeclaration(_file: SdkFile, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractSchemaGenerator.RAW_TYPE_NAME,
            type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
        });
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToNamedType(this.declaredTypeName).typeNode;
    }

    protected override getSchema(file: SdkFile): Zurg.Schema {
        return this.enumSchema.toSchema(file);
    }
}
