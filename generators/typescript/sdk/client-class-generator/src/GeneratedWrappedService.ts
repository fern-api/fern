import { SetRequired } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, Reference } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ClassDeclarationStructure, Scope, ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl.js";

export declare namespace GeneratedWrappedService {
    interface Init {
        wrapperService: GeneratedSdkClientClassImpl;
        wrappedSubpackageId: FernIr.SubpackageId;
        wrappedSubpackage: FernIr.Subpackage;
    }
}

export class GeneratedWrappedService {
    private wrapperService: GeneratedSdkClientClassImpl;
    private wrappedSubpackageId: FernIr.SubpackageId;
    private wrappedSubpackage: FernIr.Subpackage;

    constructor({ wrapperService, wrappedSubpackageId, wrappedSubpackage }: GeneratedWrappedService.Init) {
        this.wrapperService = wrapperService;
        this.wrappedSubpackageId = wrappedSubpackageId;
        this.wrappedSubpackage = wrappedSubpackage;
    }

    public addToServiceClass({
        isRoot,
        class_,
        context
    }: {
        isRoot: boolean;
        class_: SetRequired<ClassDeclarationStructure, "properties" | "ctors" | "methods" | "getAccessors">;
        context: FileContext;
    }): void {
        const referenceToWrapped = this.getReferenceToWrappedService(class_, context);
        const generatedWrappedService = context.sdkClientClass.getGeneratedSdkClientClass({
            isRoot: false,
            subpackageId: this.wrappedSubpackageId
        });

        class_.properties.push({
            name: this.getCachedMemberName(context),
            scope: Scope.Protected,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToWrapped.getTypeNode(),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                ])
            )
        });

        class_.getAccessors.push({
            name: this.getGetterName(context),
            returnType: getTextOfTsNode(referenceToWrapped.getTypeNode()),
            scope: Scope.Public,
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createParenthesizedExpression(
                            ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    this.getCachedMemberName(context)
                                ),
                                ts.SyntaxKind.QuestionQuestionEqualsToken,
                                generatedWrappedService.instantiate({
                                    referenceToClient: referenceToWrapped.getExpression(),
                                    referenceToOptions: this.wrapperService.getReferenceToOptions()
                                })
                            )
                        )
                    )
                )
            ]
        });
    }

    private getCachedMemberName(context: FileContext): string {
        return `_${this.getGetterName(context)}`;
    }

    private getGetterName(context: FileContext): string {
        const lastFernFilepathPart =
            this.wrappedSubpackage.fernFilepath.allParts[this.wrappedSubpackage.fernFilepath.allParts.length - 1];
        if (lastFernFilepathPart == null) {
            throw new Error("Cannot generate wrapped service because FernFilepath is empty");
        }
        return context.case.camelUnsafe(lastFernFilepathPart);
    }

    private getReferenceToWrappedService(
        serviceClass: SetRequired<ClassDeclarationStructure, "properties" | "ctors" | "methods">,
        context: FileContext
    ): Reference {
        const reference = context.sdkClientClass.getReferenceToClientClass({
            isRoot: false,
            subpackageId: this.wrappedSubpackageId
        });
        const wrappedServiceClassName = getTextOfTsNode(
            reference.getTypeNode({
                // we don't want to add the import unnecessarily
                isForComment: true
            })
        );

        if (wrappedServiceClassName !== serviceClass.name) {
            return reference;
        } else {
            return context.sdkClientClass.getReferenceToClientClass(
                { isRoot: false, subpackageId: this.wrappedSubpackageId },
                {
                    importAlias: `${wrappedServiceClassName}_`
                }
            );
        }
    }
}
