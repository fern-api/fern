import { ts } from "ts-morph"

import { CoreUtility } from "./CoreUtility"

export interface CallbackQueue {
    _instantiate: () => ts.NewExpression
    wrap: (args: { referenceToCallbackQueue: ts.Expression; functionToWrap: ts.Expression }) => ts.Expression
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "callback-queue",
    pathInCoreUtilities: { nameOnDisk: "callback-queue", exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => {
        return { patterns: ["src/core/callback-queue/**", "tests/unit/callback-queue/**"] }
    }
}

export class CallbackQueueImpl extends CoreUtility implements CallbackQueue {
    public readonly MANIFEST = MANIFEST

    public readonly _instantiate = this.withExportedName(
        "CallbackQueue",
        (CallbackQueue) => () => ts.factory.createNewExpression(CallbackQueue.getExpression(), undefined, undefined)
    )

    public readonly wrap = ({
        referenceToCallbackQueue,
        functionToWrap
    }: {
        referenceToCallbackQueue: ts.Expression
        functionToWrap: ts.Expression
    }): ts.Expression => {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToCallbackQueue, "wrap"),
            undefined,
            [functionToWrap]
        )
    }
}
