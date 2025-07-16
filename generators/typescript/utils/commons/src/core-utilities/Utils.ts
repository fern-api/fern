import { ts } from 'ts-morph'

import { CoreUtility } from './CoreUtility'

export interface Utils {
    readonly setObjectProperty: {
        _invoke: (args: { referenceToObject: ts.Expression; path: string; value: ts.Expression }) => ts.Expression
    }
}

export const MANIFEST: CoreUtility.Manifest = {
    name: 'utils',
    pathInCoreUtilities: { nameOnDisk: 'utils', exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => {
        return { patterns: ['src/core/utils/*.ts', 'tests/unit/utils/*.test.ts'] }
    }
}
export class UtilsImpl extends CoreUtility implements Utils {
    public readonly MANIFEST = MANIFEST

    public setObjectProperty = {
        _invoke: this.withExportedName(
            'setObjectProperty',
            (setObjectProperty) =>
                ({
                    referenceToObject,
                    path,
                    value
                }: {
                    referenceToObject: ts.Expression
                    path: string
                    value: ts.Expression
                }) =>
                    ts.factory.createCallExpression(setObjectProperty.getExpression(), undefined, [
                        referenceToObject,
                        ts.factory.createStringLiteral(path),
                        value
                    ])
        )
    }
}
