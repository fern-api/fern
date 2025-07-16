import { ts } from "ts-morph"

import { CoreUtility } from "./CoreUtility"

export interface Base64Utils {
    base64Encode: {
        _invoke: (arg: ts.Expression) => ts.CallExpression
    }
    base64Decode: {
        _invoke: (arg: ts.Expression) => ts.CallExpression
    }
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "base64-utils",
    pathInCoreUtilities: { nameOnDisk: "base64.ts", exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => ({
        patterns: ["src/core/base64.ts", "tests/unit/base64.test.ts"]
    })
}

export class Base64UtilsImpl extends CoreUtility implements Base64Utils {
    public readonly MANIFEST = MANIFEST
    public readonly base64Encode = {
        _invoke: this.withExportedName(
            "base64Encode",
            (base64Encode) => (arg: ts.Expression) =>
                ts.factory.createCallExpression(base64Encode.getExpression(), undefined, [arg])
        )
    }
    public readonly base64Decode = {
        _invoke: this.withExportedName(
            "base64Decode",
            (base64Decode) => (arg: ts.Expression) =>
                ts.factory.createCallExpression(base64Decode.getExpression(), undefined, [arg])
        )
    }
}
