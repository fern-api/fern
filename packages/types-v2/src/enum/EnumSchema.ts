import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumConst } from "./EnumConst";
import { EnumInterface } from "./EnumInterface";

export class EnumSchema extends AbstractEnumFileDeclaration {
    public toSchema(file: SdkFile): Zurg.Schema {
        const rawValueParameterName = "value";
        const referenceToParsedType = file.getReferenceToNamedType(this.typeDeclaration.name);

        return file.coreUtilities.zurg.string().transform({
            newShape: referenceToParsedType.typeNode,
            parse: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, rawValueParameterName)],
                undefined,
                undefined,
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToParsedType.expression,
                        EnumConst.PARSE_UTIL_NAME
                    ),
                    undefined,
                    [ts.factory.createIdentifier(rawValueParameterName)]
                )
            ),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createObjectBindingPattern([
                            ts.factory.createBindingElement(
                                undefined,
                                undefined,
                                ts.factory.createIdentifier(EnumInterface.VALUE_PROPERTY_NAME),
                                undefined
                            ),
                        ]),
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                undefined,
                ts.factory.createIdentifier(EnumInterface.VALUE_PROPERTY_NAME)
            ),
        });
    }
}
