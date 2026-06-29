import { ts } from "ts-morph";

import { DependencyManager, DependencyType } from "../dependency-manager/DependencyManager.js";
import { CoreUtility } from "./CoreUtility.js";

export interface GraphqlUtils {
    GraphqlSelection: {
        _getReferenceToType: () => ts.TypeNode;
    };
    Result: {
        /** `core.Result<<model>, <selection>>` — the selection-inferred result type for a GraphQL op. */
        _getReferenceToType: (model: ts.TypeNode, selection: ts.TypeNode) => ts.TypeNode;
    };
    GraphqlResponse: {
        /** `core.GraphqlResponse<<data>>` — the `{ data, errors }` envelope returned by a GraphQL op. */
        _getReferenceToType: (data: ts.TypeNode) => ts.TypeNode;
    };
    buildGraphqlQuery: {
        _getReferenceToExpression: () => ts.Expression;
        _invoke: (args: {
            scaffolding: ts.Expression;
            selection: ts.Expression;
            argContext?: ts.Expression;
        }) => ts.Expression;
    };
    subscribeGraphql: {
        _getReferenceToExpression: () => ts.Expression;
        _invoke: (args: { args: ts.Expression; typeArgument?: ts.TypeNode }) => ts.Expression;
    };
    paginateGraphql: {
        _invoke: (args: { args: ts.Expression; typeArgument?: ts.TypeNode }) => ts.Expression;
    };
    GraphqlError: {
        _getReferenceToType: () => ts.TypeNode;
        _getReferenceToExpression: () => ts.Expression;
        _construct: (args: {
            errors: ts.Expression;
            data?: ts.Expression;
            rawResponse?: ts.Expression;
        }) => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "graphql",
    pathInCoreUtilities: { nameOnDisk: "graphql", exportDeclaration: { exportAll: true } },
    // The subscription helper (subscribeGraphql.ts) imports `ws` for a WebSocket implementation on
    // node/bun/deno, mirroring the websocket core utility. Register the dependency whenever the
    // graphql core utility is emitted.
    addDependencies: (dependencyManager: DependencyManager): void => {
        dependencyManager.addDependency("ws", "^8.20.0");
        dependencyManager.addDependency("@types/ws", "^8.18.1", { type: DependencyType.DEV });
    },
    dependsOn: [],
    getFilesPatterns: () => ({
        patterns: ["src/core/graphql/**", "tests/unit/graphql/**"]
    })
};

export class GraphqlUtilsImpl extends CoreUtility implements GraphqlUtils {
    public readonly MANIFEST = MANIFEST;

    public readonly GraphqlSelection = {
        _getReferenceToType: this.withExportedName(
            "GraphqlSelection",
            (GraphqlSelection) => (): ts.TypeNode => GraphqlSelection.getTypeNode()
        )
    };

    public readonly Result = {
        _getReferenceToType: this.withExportedName(
            "Result",
            (Result) =>
                (model: ts.TypeNode, selection: ts.TypeNode): ts.TypeNode =>
                    ts.factory.createTypeReferenceNode(Result.getEntityName(), [model, selection])
        )
    };

    public readonly GraphqlResponse = {
        _getReferenceToType: this.withExportedName(
            "GraphqlResponse",
            (GraphqlResponse) =>
                (data: ts.TypeNode): ts.TypeNode =>
                    ts.factory.createTypeReferenceNode(GraphqlResponse.getEntityName(), [data])
        )
    };

    public readonly buildGraphqlQuery = {
        _getReferenceToExpression: this.withExportedName(
            "buildGraphqlQuery",
            (buildGraphqlQuery) => (): ts.Expression => buildGraphqlQuery.getExpression()
        ),
        _invoke: this.withExportedName(
            "buildGraphqlQuery",
            (buildGraphqlQuery) =>
                ({
                    scaffolding,
                    selection,
                    argContext
                }: {
                    scaffolding: ts.Expression;
                    selection: ts.Expression;
                    argContext?: ts.Expression;
                }): ts.Expression =>
                    ts.factory.createCallExpression(
                        buildGraphqlQuery.getExpression(),
                        undefined,
                        argContext != null ? [scaffolding, selection, argContext] : [scaffolding, selection]
                    )
        )
    };

    public readonly subscribeGraphql = {
        _getReferenceToExpression: this.withExportedName(
            "subscribeGraphql",
            (subscribeGraphql) => (): ts.Expression => subscribeGraphql.getExpression()
        ),
        _invoke: this.withExportedName(
            "subscribeGraphql",
            (subscribeGraphql) =>
                ({ args, typeArgument }: { args: ts.Expression; typeArgument?: ts.TypeNode }): ts.Expression =>
                    ts.factory.createCallExpression(
                        subscribeGraphql.getExpression(),
                        typeArgument != null ? [typeArgument] : undefined,
                        [args]
                    )
        )
    };

    public readonly paginateGraphql = {
        _invoke: this.withExportedName(
            "paginateGraphql",
            (paginateGraphql) =>
                ({ args, typeArgument }: { args: ts.Expression; typeArgument?: ts.TypeNode }): ts.Expression =>
                    ts.factory.createCallExpression(
                        paginateGraphql.getExpression(),
                        typeArgument != null ? [typeArgument] : undefined,
                        [args]
                    )
        )
    };

    public readonly GraphqlError = {
        _getReferenceToType: this.withExportedName(
            "GraphqlError",
            (GraphqlError) => (): ts.TypeNode => GraphqlError.getTypeNode()
        ),
        _getReferenceToExpression: this.withExportedName(
            "GraphqlError",
            (GraphqlError) => (): ts.Expression => GraphqlError.getExpression()
        ),
        _construct: this.withExportedName(
            "GraphqlError",
            (GraphqlError) =>
                ({
                    errors,
                    data,
                    rawResponse
                }: {
                    errors: ts.Expression;
                    data?: ts.Expression;
                    rawResponse?: ts.Expression;
                }): ts.Expression => {
                    const properties: ts.ObjectLiteralElementLike[] = [
                        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("errors"), errors)
                    ];
                    if (data != null) {
                        properties.push(ts.factory.createPropertyAssignment(ts.factory.createIdentifier("data"), data));
                    }
                    if (rawResponse != null) {
                        properties.push(
                            ts.factory.createPropertyAssignment(ts.factory.createIdentifier("rawResponse"), rawResponse)
                        );
                    }
                    return ts.factory.createNewExpression(GraphqlError.getExpression(), undefined, [
                        ts.factory.createObjectLiteralExpression(properties, true)
                    ]);
                }
        )
    };
}
