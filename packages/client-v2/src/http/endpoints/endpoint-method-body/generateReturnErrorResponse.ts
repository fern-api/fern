import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { File } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";
import { getBaseResponseProperties } from "./getBaseResponseProperties";

export function generateReturnErrorResponse({ file, body }: { file: File; body: ts.Expression }): ts.Statement {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ...getBaseResponseProperties({ ok: false, file }),
                createPropertyAssignment(
                    file.externalDependencies.serviceUtils._Response.Failure.BODY_PROPERTY_NAME,
                    body
                ),
            ],
            true
        )
    );
}
