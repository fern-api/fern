import { SourceFile, ts } from 'ts-morph'

import { ExportedDirectory, ExportedFilePath, ExportsManager } from '../exports-manager'
import { ImportsManager } from '../imports-manager/ImportsManager'
import { GetReferenceOpts, Reference } from './Reference'
import { getEntityNameOfDirectory } from './getEntityNameOfDirectory'
import { getExpressionToDirectory } from './getExpressionToDirectory'
import { getRelativePathAsModuleSpecifierTo } from './getRelativePathAsModuleSpecifierTo'

export function getReferenceToExportViaNamespaceImport({
    exportedName,
    filepathToNamespaceImport,
    filepathInsideNamespaceImport,
    namespaceImport,
    importsManager,
    exportsManager,
    referencedIn,
    subImport = []
}: {
    exportedName: string
    filepathToNamespaceImport: ExportedFilePath
    filepathInsideNamespaceImport: ExportedDirectory[] | ExportedFilePath | undefined
    namespaceImport: string
    importsManager: ImportsManager
    exportsManager: ExportsManager
    referencedIn: SourceFile
    subImport?: string[]
}): Reference {
    const addImport = () => {
        importsManager.addImport(
            getRelativePathAsModuleSpecifierTo({
                from: referencedIn,
                to: exportsManager.convertExportedFilePathToFilePath(filepathToNamespaceImport)
            }),
            { namespaceImport }
        )
    }

    const pathToDirectoryInsideNamespaceImport =
        filepathInsideNamespaceImport != null
            ? Array.isArray(filepathInsideNamespaceImport)
                ? filepathInsideNamespaceImport
                : filepathInsideNamespaceImport.directories
            : []

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        getEntityNameOfDirectory({
            pathToDirectory: pathToDirectoryInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
            exportsManager
        })
    )

    const expression = [exportedName, ...subImport].reduce<ts.Expression>(
        (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
        getExpressionToDirectory({
            pathToDirectory: pathToDirectoryInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
            exportsManager
        })
    )

    return {
        getTypeNode: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport()
            }
            return ts.factory.createTypeReferenceNode(entityName)
        },
        getEntityName: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport()
            }
            return entityName
        },
        getExpression: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport()
            }
            return expression
        }
    }
}
