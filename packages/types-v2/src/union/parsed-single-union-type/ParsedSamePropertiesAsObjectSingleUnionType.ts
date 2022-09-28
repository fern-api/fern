import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionVisitHelper } from "../UnionVisitHelper";
import { AbstractParsedSingleUnionType } from "./AbstractParsedSingleUnionType";

export class ParsedSamePropertiesAsObjectSingleUnionType extends AbstractParsedSingleUnionType {
    private extended: DeclaredTypeName;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ extended, ...superInit }: { extended: DeclaredTypeName } & AbstractParsedSingleUnionType.Init) {
        super(superInit);
        this.extended = extended;
    }

    protected getExtendsForInterface(file: SdkFile, { isRaw }: { isRaw: boolean }): ts.TypeNode[] {
        return [
            isRaw
                ? file.getReferenceToRawNamedType(this.extended).typeNode
                : file.getReferenceToNamedType(this.extended).typeNode,
        ];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ParsedSamePropertiesAsObjectSingleUnionType.BUILDER_PARAMETER_NAME,
                undefined,
                file.getReferenceToNamedType(this.extended).typeNode
            ),
        ];
    }

    protected getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(ParsedSamePropertiesAsObjectSingleUnionType.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    protected getVisitorCallForBuilder(): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: [
                ts.factory.createIdentifier(ParsedSamePropertiesAsObjectSingleUnionType.BUILDER_PARAMETER_NAME),
            ],
        });
    }

    protected getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToNamedType(this.extended).typeNode;
    }

    public getVisitMethod({ referenceToUnionValue }: { referenceToUnionValue: ts.Expression }): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: [referenceToUnionValue],
        });
    }

    protected getNonDiscriminantPropertiesForSchema(
        file: SdkFile
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: false,
            objectSchema: file.getSchemaOfNamedType(this.extended),
        };
    }
}
