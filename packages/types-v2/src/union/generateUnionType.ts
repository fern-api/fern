import { SingleUnionTypeProperties, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateSchemaDeclarations } from "../generateSchemaDeclarations";
import { AbstractUnionFileDeclaration } from "./AbstractUnionFileDeclaration";
import { ParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { ParsedNoPropertiesSingleUnionType } from "./parsed-single-union-type/ParsedNoPropertiesSingleUnionType";
import { ParsedSamePropertiesAsObjectSingleUnionType } from "./parsed-single-union-type/ParsedSamePropertiesAsObjectSingleUnionType";
import { ParsedSinglePropertySingleUnionType } from "./parsed-single-union-type/ParsedSinglePropertySingleUnionType";
import { RawUnionType } from "./RawUnionType";
import { UnionConst } from "./UnionConst";
import { UnionModule } from "./UnionModule";
import { UnionSchema } from "./UnionSchema";
import { UnionTypeAlias } from "./UnionTypeAlias";
import { UnionVisitHelper } from "./UnionVisitHelper";

export declare namespace generateUnionType {
    export interface Args {
        typeFile: SdkFile;
        schemaFile: SdkFile;
        typeName: string;
        typeDeclaration: TypeDeclaration;
        union: UnionTypeDeclaration;
    }
}

export function generateUnionType({
    typeFile,
    schemaFile,
    typeName,
    typeDeclaration,
    union,
}: generateUnionType.Args): void {
    const parsedSingleUnionTypes = union.types.map((singleUnionType) =>
        SingleUnionTypeProperties._visit<ParsedSingleUnionType>(singleUnionType.shape, {
            noProperties: () => new ParsedNoPropertiesSingleUnionType({ union, singleUnionType }),
            singleProperty: (singleProperty) =>
                new ParsedSinglePropertySingleUnionType({ union, singleUnionType, singleProperty }),
            samePropertiesAsObject: (extended) =>
                new ParsedSamePropertiesAsObjectSingleUnionType({ union, singleUnionType, extended }),
            _unknown: () => {
                throw new Error("Unknown single union type: " + singleUnionType.shape._type);
            },
        })
    );

    const unionFileDeclarationInit: AbstractUnionFileDeclaration.Init = {
        union,
        typeDeclaration,
        typeName,
        parsedSingleUnionTypes,
    };

    const typeAlias = new UnionTypeAlias(unionFileDeclarationInit);
    const module = new UnionModule(unionFileDeclarationInit);
    const const_ = new UnionConst(unionFileDeclarationInit);
    const visitHelper = new UnionVisitHelper({ parsedSingleUnionTypes, union });

    typeAlias.writeToFile(typeFile, module);
    module.writeToFile(typeFile, visitHelper);
    const_.writeToFile(typeFile, module);

    generateSchemaDeclarations({
        schemaFile,
        schema: new UnionSchema(unionFileDeclarationInit).toSchema(schemaFile),
        typeDeclaration,
        typeName,
        generateRawTypeDeclaration: (module, rawTypeName) => {
            new RawUnionType({
                file: schemaFile,
                module,
                rawTypeName,
                ...unionFileDeclarationInit,
            }).writeToModule();
        },
    });
}
