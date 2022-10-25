import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ClassDeclaration, Scope, ts } from "ts-morph";
import { Client } from "./Client";

export declare namespace WrappedServiceGenerator {
    interface Init {
        wrappedService: DeclaredServiceName;
    }
}

export class WrappedServiceGenerator {
    private wrappedService: DeclaredServiceName;

    constructor({ wrappedService }: WrappedServiceGenerator.Init) {
        this.wrappedService = wrappedService;
    }

    public addToServiceClass(class_: ClassDeclaration, file: SdkFile): void {
        const referenceToWrapped = this.getReferenceToWrappedService(file);

        class_.addProperty({
            name: this.getCachedMemberName(),
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToWrapped.typeNode,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ])
            ),
        });

        class_.addGetAccessor({
            name: this.getGetterName(),
            returnType: getTextOfTsNode(referenceToWrapped.typeNode),
            scope: Scope.Public,
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createParenthesizedExpression(
                            ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    this.getCachedMemberName()
                                ),
                                ts.SyntaxKind.QuestionQuestionEqualsToken,
                                Client.instatiate({
                                    referenceToClient: referenceToWrapped.expression,
                                    referenceToOptions: Client.getReferenceToOptions(),
                                })
                            )
                        )
                    )
                ),
            ],
        });
    }

    private getCachedMemberName(): string {
        return `#${this.getGetterName()}`;
    }

    private getGetterName(): string {
        const lastFernFilepathPart = this.wrappedService.fernFilepath[this.wrappedService.fernFilepathV2.length - 1];
        if (lastFernFilepathPart == null) {
            throw new Error("Cannot generate wrapped service because FernFilepath is empty");
        }
        return lastFernFilepathPart.camelCase;
    }

    private getImportAlias(): string {
        const lastFernFilepathPart = this.wrappedService.fernFilepath[this.wrappedService.fernFilepathV2.length - 1];
        if (lastFernFilepathPart == null) {
            throw new Error("Cannot generate wrapped service because FernFilepath is empty");
        }
        return `${lastFernFilepathPart.pascalCase}Client`;
    }

    private getReferenceToWrappedService(file: SdkFile): Reference {
        return file.getReferenceToService(this.wrappedService, {
            importAlias: this.getImportAlias(),
        });
    }
}
