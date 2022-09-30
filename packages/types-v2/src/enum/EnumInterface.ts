import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumModule } from "./EnumModule";
import { EnumVisitHelper } from "./EnumVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export class EnumInterface extends AbstractEnumFileDeclaration {
    public static GET_METHOD_NAME = "get";
    public static VISIT_METHOD_NAME = "visit";
    private static RAW_VALUE_TYPE_PARAMETER_NAME = EnumModule.RAW_VALUE_TYPE_ALIAS_NAME;

    public writeToFile(file: SdkFile, enumModule: EnumModule): void {
        const interfaceNode = file.sourceFile.addInterface({
            name: this.getInterfaceName(),
            typeParameters: [
                {
                    name: EnumInterface.RAW_VALUE_TYPE_PARAMETER_NAME,
                    constraint: getTextOfTsNode(enumModule.getReferenceToRawValue()),
                    default: getTextOfTsNode(enumModule.getReferenceToRawValue()),
                },
            ],
            isExported: true,
        });
        maybeAddDocs(interfaceNode, this.typeDeclaration.docs);

        interfaceNode.addProperty({
            name: EnumInterface.GET_METHOD_NAME,
            type: getTextOfTsNode(
                ts.factory.createFunctionTypeNode(
                    undefined,
                    [],
                    ts.factory.createTypeReferenceNode(EnumInterface.RAW_VALUE_TYPE_PARAMETER_NAME)
                )
            ),
        });

        interfaceNode.addProperty({
            name: EnumInterface.VISIT_METHOD_NAME,
            type: getTextOfTsNode(
                EnumVisitHelper.getSignature({
                    getReferenceToVisitor: enumModule.getReferenceToVisitorInterface.bind(enumModule),
                })
            ),
        });
    }

    public getReferenceToEnumValue(enumValue?: ParsedEnumValue): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            this.getInterfaceName(),
            enumValue != null ? [enumValue.getRawValue().typeNode] : undefined
        );
    }

    private getInterfaceName(): string {
        return this.typeName;
    }

    public static getReferenceToRawValue(referenceToEnumValue: ts.Expression): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToEnumValue, EnumInterface.GET_METHOD_NAME),
            undefined,
            undefined
        );
    }
}
