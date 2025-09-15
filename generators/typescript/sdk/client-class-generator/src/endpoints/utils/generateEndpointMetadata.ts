import { ts } from "ts-morph";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";

export function generatedEndpointMetadata(): ts.Statement[] {
    return [
        ts.factory.createVariableStatement(
            [],
            [
                ts.factory.createVariableDeclaration(
                    GeneratedSdkClientClassImpl.METADATA_FOR_TOKEN_SUPPLIER_VAR,
                    undefined,
                    undefined,
                    ts.factory.createObjectLiteralExpression([], false)
                )
            ]
        )
    ];
}
