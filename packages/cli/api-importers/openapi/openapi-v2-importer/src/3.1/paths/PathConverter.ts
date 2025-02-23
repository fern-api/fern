import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";


import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { OperationConverter } from "./OperationConverter";

export declare namespace PathConverter {
    export interface Args extends AbstractConverter.Args {
        pathItem: OpenAPIV3_1.PathItemObject;
        path: string;
    }

    export interface Output {
        endpoints: OperationConverter.Output[];
    }
}

export class PathConverter extends AbstractConverter<OpenAPIConverterContext3_1, PathConverter.Output> {
    private readonly pathItem: OpenAPIV3_1.PathItemObject;
    private readonly path: string;

    constructor({ breadcrumbs, pathItem, path }: PathConverter.Args) {
        super({ breadcrumbs });
        this.pathItem = pathItem;
        this.path = path;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): PathConverter.Output | undefined {
        const endpoints: OperationConverter.Output[] = [];

        // Check each HTTP method
        const methods = ["get", "post", "put", "delete", "patch"] as const;
        for (const method of methods) {
            const operation = this.pathItem[method];
            if (operation != null) {
                const operationConverter = new OperationConverter({
                    breadcrumbs: [...this.breadcrumbs, method],
                    operation,
                    method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
                    path: this.path
                });
                const convertedOperation = operationConverter.convert({ context, errorCollector });
                if (convertedOperation != null) {
                    endpoints.push(convertedOperation);
                }
            }
        }

        return {
            endpoints
        };
    }
}
