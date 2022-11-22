import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractUnionGenerator } from "./AbstractUnionGenerator";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { ParsedSingleUnionTypeForUnion } from "./parsed-single-union-type/ParsedSingleUnionTypeForUnion";

export declare namespace UnionTypeGenerator {
    export interface Init {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        union: UnionTypeDeclaration;
    }
}

export class UnionTypeGenerator extends AbstractUnionGenerator {
    private typeDeclaration: TypeDeclaration;

    constructor({ typeName, typeDeclaration, union }: UnionTypeGenerator.Init) {
        const parsedSingleUnionTypes = union.types.map(
            (singleUnionType) => new ParsedSingleUnionTypeForUnion({ singleUnionType, union })
        );

        super({
            typeName,
            getReferenceToUnion: (file: SdkFile) => file.getReferenceToNamedType(typeDeclaration.name),
            docs: typeDeclaration.docs,
            discriminant: union.discriminantV2,
            parsedSingleUnionTypes,
            unknownSingleUnionType: {
                discriminantType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                getVisitorArgument: () =>
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                AbstractParsedSingleUnionType.getDiscriminantKey(union.discriminantV2)
                            ),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ),
                    ]),
            },
        });

        this.typeDeclaration = typeDeclaration;
    }

    protected override getReferenceToUnionType(file: SdkFile): Reference {
        return file.getReferenceToNamedType(this.typeDeclaration.name);
    }

    protected override shouldWriteSchema(): boolean {
        return true;
    }
}
