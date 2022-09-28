import { Zurg } from "@fern-typescript/commons-v2";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionVisitHelper } from "../UnionVisitHelper";
import { AbstractParsedSingleUnionType } from "./AbstractParsedSingleUnionType";

export class ParsedNoPropertiesSingleUnionType extends AbstractParsedSingleUnionType {
    protected getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getParametersForBuilder(): ts.ParameterDeclaration[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [];
    }

    protected getVisitorCallForBuilder(): ts.ArrowFunction {
        return this.getVisitMethod();
    }

    protected getVisitMethodParameterType(): ts.TypeNode | undefined {
        return undefined;
    }

    public getVisitMethod(): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: [],
        });
    }

    protected getNonDiscriminantPropertiesForSchema(): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return { isInline: true, properties: [] };
    }
}
