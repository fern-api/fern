import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility.js";

export interface WebhookCrypto {
    computeHmacSignature: {
        _invoke: (args: ts.Expression) => ts.Expression;
    };
    verifyAsymmetricSignature: {
        _invoke: (args: ts.Expression) => ts.Expression;
    };
    timingSafeEqual: {
        _invoke: (a: ts.Expression, b: ts.Expression) => ts.Expression;
    };
    fetchJwks: {
        _invoke: (args: ts.Expression) => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "webhookCrypto",
    pathInCoreUtilities: { nameOnDisk: "webhooks", exportDeclaration: { exportAll: true } },
    dependsOn: [],
    getFilesPatterns: () => {
        return { patterns: ["src/core/webhooks/**", "tests/unit/webhooks/**"] };
    }
};

export class WebhookCryptoImpl extends CoreUtility implements WebhookCrypto {
    public readonly MANIFEST = MANIFEST;

    public readonly computeHmacSignature = {
        _invoke: this.withExportedName(
            "computeHmacSignature",
            (computeHmacSignature) =>
                (args: ts.Expression): ts.Expression => {
                    return ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(computeHmacSignature.getExpression(), undefined, [args])
                    );
                }
        )
    };

    public readonly verifyAsymmetricSignature = {
        _invoke: this.withExportedName(
            "verifyAsymmetricSignature",
            (verifyAsymmetricSignature) =>
                (args: ts.Expression): ts.Expression => {
                    return ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(verifyAsymmetricSignature.getExpression(), undefined, [args])
                    );
                }
        )
    };

    public readonly timingSafeEqual = {
        _invoke: this.withExportedName(
            "timingSafeEqual",
            (timingSafeEqual) =>
                (a: ts.Expression, b: ts.Expression): ts.Expression => {
                    return ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(timingSafeEqual.getExpression(), undefined, [a, b])
                    );
                }
        )
    };

    public readonly fetchJwks = {
        _invoke: this.withExportedName("fetchJwks", (fetchJwks) => (args: ts.Expression): ts.Expression => {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(fetchJwks.getExpression(), undefined, [args])
            );
        })
    };
}
