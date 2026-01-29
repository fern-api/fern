import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface Webhooks {
    WebhooksHelper: {
        _getReferenceToType: () => ts.TypeNode;

        verifySignature: (args: {
            requestBody: ts.Expression;
            signatureHeader: ts.Expression;
            secret: ts.Expression;
            notificationUrl?: ts.Expression;
        }) => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "webhooks",
    pathInCoreUtilities: { nameOnDisk: "webhooks", exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => {
        return { patterns: ["src/core/webhooks/**"] };
    }
};

export class WebhooksImpl extends CoreUtility implements Webhooks {
    public readonly MANIFEST = MANIFEST;

    public readonly WebhooksHelper = {
        _getReferenceToType: this.withExportedName(
            "WebhooksHelper",
            (WebhooksHelper) => () => WebhooksHelper.getTypeNode()
        ),
        verifySignature: this.withExportedName(
            "WebhooksHelper",
            (WebhooksHelper) =>
                (args: {
                    requestBody: ts.Expression;
                    signatureHeader: ts.Expression;
                    secret: ts.Expression;
                    notificationUrl?: ts.Expression;
                }): ts.Expression => {
                    const properties: ts.ObjectLiteralElementLike[] = [
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("requestBody"),
                            args.requestBody
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("signatureHeader"),
                            args.signatureHeader
                        ),
                        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("secret"), args.secret)
                    ];

                    if (args.notificationUrl != null) {
                        properties.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("notificationUrl"),
                                args.notificationUrl
                            )
                        );
                    }

                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            WebhooksHelper.getExpression(),
                            ts.factory.createIdentifier("verifySignature")
                        ),
                        undefined,
                        [ts.factory.createObjectLiteralExpression(properties, true)]
                    );
                }
        )
    };
}
