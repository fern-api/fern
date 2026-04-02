import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { caseConverter, casingsGenerator, createHttpEndpoint, createHttpService } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { AbstractRequestParameter } from "../request-parameter/AbstractRequestParameter.js";

// ─── Concrete subclass for testing ──────────────────────────────────────────

class TestRequestParameter extends AbstractRequestParameter {
    private readonly typeNode: ts.TypeNode;
    private readonly hasQuestionToken: boolean;
    private readonly initializerExpr: ts.Expression | undefined;

    constructor(
        init: AbstractRequestParameter.Init & {
            typeNode?: ts.TypeNode;
            hasQuestionToken?: boolean;
            initializer?: ts.Expression;
        }
    ) {
        super(init);
        this.typeNode = init.typeNode ?? ts.factory.createTypeReferenceNode("TestRequestType");
        this.hasQuestionToken = init.hasQuestionToken ?? false;
        this.initializerExpr = init.initializer;
    }

    public getType(): ts.TypeNode {
        return this.typeNode;
    }

    public getInitialStatements(): ts.Statement[] {
        return [];
    }

    public getAllQueryParameters(): FernIr.QueryParameter[] {
        return [];
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        return undefined;
    }

    public getReferenceToPathParameter(): ts.Expression {
        return ts.factory.createIdentifier("pathParam");
    }

    public getReferenceToQueryParameter(): ts.Expression {
        return ts.factory.createIdentifier("queryParam");
    }

    public getReferenceToNonLiteralHeader(): ts.Expression {
        return ts.factory.createIdentifier("headerValue");
    }

    public withQueryParameter(): ts.Statement[] {
        return [];
    }

    public generateExample(): ts.Expression | undefined {
        return undefined;
    }

    public isOptional(): boolean {
        return this.hasQuestionToken;
    }

    protected getParameterType(): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        return {
            type: this.typeNode,
            hasQuestionToken: this.hasQuestionToken,
            initializer: this.initializerExpr
        };
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function createSdkRequest(name: string): FernIr.SdkRequest {
    return {
        streamParameter: undefined,
        requestParameterName: casingsGenerator.generateName(name),
        shape: FernIr.SdkRequestShape.justRequestBody(
            FernIr.SdkRequestBodyType.typeReference({
                requestBodyType: FernIr.TypeReference.primitive({
                    v1: "STRING",
                    v2: undefined
                }),
                contentType: undefined,
                docs: undefined,
                v2Examples: undefined
            })
        )
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(): any {
    return {};
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("AbstractRequestParameter", () => {
    describe("constructor", () => {
        it("stores packageId, service, endpoint, and sdkRequest", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                caseConverter
            });
            expect(param).toBeDefined();
        });
    });

    describe("getParameterDeclaration", () => {
        it("returns declaration with name from sdkRequest", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("myRequest"),
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.name).toBe("myRequest");
        });

        it("returns declaration with type from getParameterType", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                typeNode: ts.factory.createTypeReferenceNode("CustomType"),
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.type).toBe("CustomType");
        });

        it("returns declaration with hasQuestionToken=false by default", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.hasQuestionToken).toBe(false);
        });

        it("returns declaration with hasQuestionToken=true when optional", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                hasQuestionToken: true,
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.hasQuestionToken).toBe(true);
        });

        it("returns declaration with initializer when provided", () => {
            const initializer = ts.factory.createObjectLiteralExpression([]);
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                initializer,
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.initializer).toBe("{}");
        });

        it("returns declaration with undefined initializer when not provided", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("request"),
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            expect(decl.initializer).toBeUndefined();
        });
    });

    describe("getRequestParameterName (protected)", () => {
        it("uses camelCase unsafeName from sdkRequest", () => {
            const param = new TestRequestParameter({
                packageId: { isRoot: true } as unknown as PackageId,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                sdkRequest: createSdkRequest("mySpecialRequest"),
                caseConverter
            });
            const context = createMockContext();
            const decl = param.getParameterDeclaration(context);
            // The casingsGenerator transforms "mySpecialRequest" to camelCase
            expect(decl.name).toBe("mySpecialRequest");
        });
    });
});
