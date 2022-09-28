import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { generateSchemaDeclarations } from "../generateSchemaDeclarations";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumConst } from "./EnumConst";
import { EnumInterface } from "./EnumInterface";
import { EnumModule } from "./EnumModule";
import { EnumSchema } from "./EnumSchema";
import { EnumVisitHelper } from "./EnumVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export const ENUM_VALUES_PROPERTY_KEY = "_values";

export function generateEnumType({
    typeFile,
    schemaFile,
    typeName,
    typeDeclaration,
    shape,
}: {
    typeFile: SdkFile;
    schemaFile: SdkFile;
    typeName: string;
    typeDeclaration: TypeDeclaration;
    shape: EnumTypeDeclaration;
}): void {
    const parsedEnumValues = shape.values.map((enumValue) => new ParsedEnumValue({ enumValue }));

    const enumFileDeclarationInit: AbstractEnumFileDeclaration.Init = {
        enum_: shape,
        typeDeclaration,
        typeName,
        parsedEnumValues,
    };

    const enumInterface = new EnumInterface(enumFileDeclarationInit);
    const enumConst = new EnumConst(enumFileDeclarationInit);
    const enumModule = new EnumModule(enumFileDeclarationInit);
    const visitHelper = new EnumVisitHelper({ parsedEnumValues });

    enumInterface.writeToFile(typeFile, enumModule);
    enumConst.writeToFile(typeFile, enumInterface);
    enumModule.writeToFile(typeFile, visitHelper);

    generateSchemaDeclarations({
        schemaFile,
        schema: new EnumSchema(enumFileDeclarationInit).toSchema(schemaFile),
        typeDeclaration,
        typeName,
        generateRawTypeDeclaration: (module, rawTypeName) => {
            module.addTypeAlias({
                name: rawTypeName,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            });
        },
    });
}
