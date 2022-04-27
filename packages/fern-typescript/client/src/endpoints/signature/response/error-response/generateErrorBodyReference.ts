import { ResponseErrors } from "@fern-api/api";
import {
    generateNamedTypeReference,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
    withSourceFile,
} from "@fern-typescript/commons";
import { Directory, SourceFile, ts, VariableDeclarationKind } from "ts-morph";

const ERROR_BODY_TYPE_NAME = "ErrorBody";

// TODO put this in IR!
const ERROR_TYPE_DISCRIMINANT = "_type";

export function generateErrorBodyReference({
    referencedIn,
    errors,
    errorsDirectory,
}: {
    referencedIn: SourceFile;
    errors: ResponseErrors;
    errorsDirectory: Directory;
}): ts.TypeNode {
    withSourceFile(
        { directory: referencedIn.getDirectory(), filepath: `${ERROR_BODY_TYPE_NAME}.ts` },
        (errorBodyFile) => {
            const errorBodyType = errorBodyFile.addTypeAlias({
                name: ERROR_BODY_TYPE_NAME,
                isExported: true,
                type: getWriterForMultiLineUnionType(
                    errors.possibleErrors.map((error) => ({
                        node: generateNamedTypeReference({
                            typeName: error.error,
                            referencedIn: errorBodyFile,
                            baseDirectory: errorsDirectory,
                        }),
                        docs: error.docs,
                    }))
                ),
            });
            maybeAddDocs(errorBodyType, errors.docs);

            const visitorItems: visitorUtils.VisitableItem[] = errors.possibleErrors.map((error) => ({
                caseInSwitchStatement: ts.factory.createStringLiteral(error.error.name),
                keyInVisitor: error.discriminantValue,
                visitorArgument: {
                    argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                    type: generateNamedTypeReference({
                        typeName: error.error,
                        referencedIn: errorBodyFile,
                        baseDirectory: errorsDirectory,
                    }),
                },
            }));

            errorBodyFile.addVariableStatement({
                declarationKind: VariableDeclarationKind.Const,
                isExported: true,
                declarations: [
                    {
                        name: visitorUtils.VISIT_PROPERTY_NAME,
                        initializer: getTextOfTsNode(
                            visitorUtils.generateVisitMethod({
                                typeName: ERROR_BODY_TYPE_NAME,
                                switchOn: ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                    ts.factory.createIdentifier(ERROR_TYPE_DISCRIMINANT)
                                ),
                                items: visitorItems,
                            })
                        ),
                    },
                ],
            });

            const module = errorBodyFile.addModule({
                name: ERROR_BODY_TYPE_NAME,
                isExported: true,
                hasDeclareKeyword: true,
            });
            module.addInterface(visitorUtils.generateVisitorInterface(visitorItems));

            referencedIn.addImportDeclaration({
                namedImports: [ERROR_BODY_TYPE_NAME],
                moduleSpecifier: referencedIn.getRelativePathAsModuleSpecifierTo(errorBodyFile),
            });
        }
    );

    return ts.factory.createTypeReferenceNode(ERROR_BODY_TYPE_NAME);
}
