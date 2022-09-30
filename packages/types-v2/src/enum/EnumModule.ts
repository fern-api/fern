import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumVisitHelper } from "./EnumVisitHelper";

export class EnumModule extends AbstractEnumFileDeclaration {
    public static RAW_VALUE_TYPE_ALIAS_NAME = "RawValue";

    public writeToFile(file: SdkFile, visitHelper: EnumVisitHelper): void {
        const module = file.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true,
        });

        module.addTypeAlias({
            name: EnumModule.RAW_VALUE_TYPE_ALIAS_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    ...this.parsedEnumValues.map((enumValue) => enumValue.getRawValue().typeNode),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ])
            ),
        });

        module.addInterface(visitHelper.getVisitorInterface(file));
    }

    private getModuleName() {
        return this.typeName;
    }

    public getReferenceToRawValue(): ts.TypeNode {
        return EnumModule.getReferenceToRawValue({
            referenceToModule: ts.factory.createIdentifier(this.getModuleName()),
        });
    }

    public static getReferenceToRawValue({ referenceToModule }: { referenceToModule: ts.EntityName }): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            EnumModule.getReferenceTo({
                name: EnumModule.RAW_VALUE_TYPE_ALIAS_NAME,
                referenceToModule,
            })
        );
    }

    public getReferenceToVisitorInterface(): ts.EntityName {
        return this.getReferenceTo(EnumVisitHelper.VISITOR_INTERFACE_NAME);
    }

    private getReferenceTo(name: string): ts.EntityName {
        return EnumModule.getReferenceTo({
            name,
            referenceToModule: ts.factory.createIdentifier(this.getModuleName()),
        });
    }

    private static getReferenceTo({
        name,
        referenceToModule,
    }: {
        name: string;
        referenceToModule: ts.EntityName;
    }): ts.EntityName {
        return ts.factory.createQualifiedName(referenceToModule, ts.factory.createIdentifier(name));
    }
}
