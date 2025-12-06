import { getTextOfTsNode, Reference, Zurg } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts, VariableDeclarationKind } from "ts-morph";

export declare namespace AbstractGeneratedSchema {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractGeneratedSchema<Context extends BaseContext> {
    protected static RAW_TYPE_NAME = "Raw";

    protected typeName: string;

    constructor({ typeName }: AbstractGeneratedSchema.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(context: Context): void {
        const schema = this.buildSchema(context);
        const schemaExpression = schema.toExpression();
        const toJsonExpression = schema.toJsonExpression;

        // For Zod format, always generate a wrapper object with parse and json methods
        // This is needed because Zod schemas don't have built-in bidirectional serialization
        if (context.coreUtilities.zurg.name === "zod") {
            // Generate:
            //   const _<typeName>_Schema = <zodSchema>;
            //   export const <typeName> = { _schema: _<typeName>_Schema, parse: ..., json: ... };
            const internalSchemaName = `_${this.typeName}_Schema`;
            const parsedParam = ts.factory.createIdentifier("parsed");
            const rawParam = ts.factory.createIdentifier("raw");
            const schemaRef = ts.factory.createIdentifier(internalSchemaName);

            // First, add the internal schema variable
            context.sourceFile.addVariableStatement({
                isExported: false,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: internalSchemaName,
                        initializer: getTextOfTsNode(schemaExpression)
                    }
                ]
            });

            // If no toJsonExpression, use identity function: (parsed) => parsed
            const jsonBody = toJsonExpression ? toJsonExpression(parsedParam) : parsedParam;

            // Get the type nodes for parameter annotations
            const parsedTypeNode = this.getReferenceToParsedShape(context);

            // Get the raw type node for json return type cast
            const rawTypeNode = this.getReferenceToRawShape(context);

            const wrapperObject = ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment("_schema", schemaRef),
                    ts.factory.createPropertyAssignment(
                        "parse",
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    rawParam,
                                    undefined,
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                                )
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            // Cast the parse result to the expected Parsed type to fix Zod's loose inference
                            ts.factory.createAsExpression(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(schemaRef, "parse"),
                                    undefined,
                                    [rawParam]
                                ),
                                parsedTypeNode
                            )
                        )
                    ),
                    ts.factory.createPropertyAssignment(
                        "json",
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    parsedParam,
                                    undefined,
                                    parsedTypeNode
                                )
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            // Cast the json result to the expected Raw type
                            ts.factory.createAsExpression(jsonBody, rawTypeNode)
                        )
                    )
                ],
                true
            );

            // Then add the exported wrapper
            context.sourceFile.addVariableStatement({
                isExported: true,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: this.typeName,
                        type: getTextOfTsNode(
                            this.getReferenceToSchemaType({
                                context,
                                rawShape: this.getReferenceToRawShape(context),
                                parsedShape: this.getReferenceToParsedShape(context)
                            })
                        ),
                        initializer: getTextOfTsNode(wrapperObject)
                    }
                ]
            });
        } else {
            // Original behavior for Zurg format
            context.sourceFile.addVariableStatement({
                isExported: true,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: this.typeName,
                        type: getTextOfTsNode(
                            this.getReferenceToSchemaType({
                                context,
                                rawShape: this.getReferenceToRawShape(context),
                                parsedShape: this.getReferenceToParsedShape(context)
                            })
                        ),
                        initializer: getTextOfTsNode(schemaExpression)
                    }
                ]
            });
        }

        this.generateModule(context);
    }

    public getReferenceToZurgSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg.Schema._fromExpression(this.getReferenceToSchema(context).getExpression());
    }

    public getReferenceToRawShape(context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToSchema(context).getEntityName(),
                AbstractGeneratedSchema.RAW_TYPE_NAME
            )
        );
    }

    protected getReferenceToSchemaType({
        context,
        rawShape,
        parsedShape
    }: {
        context: Context;
        rawShape: ts.TypeNode;
        parsedShape: ts.TypeNode;
    }): ts.TypeNode {
        return context.coreUtilities.zurg.Schema._getReferenceToType({ rawShape, parsedShape });
    }

    protected generateModule(context: Context): void {
        const module = context.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true
        });
        this.generateRawTypeDeclaration(context, module);
    }

    protected abstract getReferenceToSchema(context: Context): Reference;
    protected abstract generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void;
    protected abstract getReferenceToParsedShape(context: Context): ts.TypeNode;
    protected abstract buildSchema(context: Context): Zurg.Schema;

    protected getModuleName(): string {
        return this.typeName;
    }
}
