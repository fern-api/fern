import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Reference, ServiceContext } from "@fern-typescript/contexts";
import { ClassDeclaration, Scope, ts } from "ts-morph";
import { GeneratedServiceImpl } from "./GeneratedServiceImpl";

export declare namespace GeneratedWrappedService {
    interface Init {
        wrapperService: GeneratedServiceImpl;
        wrappedService: DeclaredServiceName;
    }
}

export class GeneratedWrappedService {
    private wrapperService: GeneratedServiceImpl;
    private wrappedService: DeclaredServiceName;

    constructor({ wrapperService, wrappedService }: GeneratedWrappedService.Init) {
        this.wrapperService = wrapperService;
        this.wrappedService = wrappedService;
    }

    public addToServiceClass(class_: ClassDeclaration, context: ServiceContext): void {
        const referenceToWrapped = this.getReferenceToWrappedService(context);
        const generatedWrappedService = context.service.getGeneratedService(this.wrappedService);

        class_.addProperty({
            name: this.getCachedMemberName(),
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToWrapped.getTypeNode(),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ])
            ),
        });

        class_.addGetAccessor({
            name: this.getGetterName(),
            returnType: getTextOfTsNode(referenceToWrapped.getTypeNode()),
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
                                generatedWrappedService.instantiate({
                                    referenceToClient: referenceToWrapped.getExpression(),
                                    referenceToOptions: this.wrapperService.getReferenceToOptions(),
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

    private getReferenceToWrappedService(context: ServiceContext): Reference {
        return context.service.getReferenceToService(this.wrappedService, {
            importAlias: this.getImportAlias(),
        });
    }
}
