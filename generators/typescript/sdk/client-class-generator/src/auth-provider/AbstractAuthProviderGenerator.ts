import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace AbstractAuthProviderGenerator {
    export interface Init {
        // Common initialization parameters for auth generators
    }
}

export abstract class AbstractAuthProviderGenerator {
    constructor(init: AbstractAuthProviderGenerator.Init) {
        // Initialize common properties
    }

    /**
     * Get the TypeScript type node for the concrete authentication class
     */
    public abstract getAuthProviderClassType(): ts.TypeNode;

    /**
     * Get the TypeScript type node for the options type passed to the constructor
     */
    public abstract getOptionsType(): ts.TypeNode;

    /**
     * Generate instantiation of the concrete class with the provided constructor expressions
     */
    public abstract instantiate(constructorArgs: ts.Expression[]): ts.Expression;

    public invokeGetHeaders(instanceExpression: ts.Expression): ts.Expression {
        return ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    instanceExpression,
                    ts.factory.createIdentifier("getHeaders")
                ),
                undefined,
                []
            )
        );
    }

    public abstract writeToFile(context: SdkContext): void;

    public abstract getFilePath(): ExportedFilePath;
}
