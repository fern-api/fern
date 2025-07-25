import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { HttpEndpoint, HttpService, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class SubClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly subpackage: Subpackage;
    private readonly service?: HttpService;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
    }

    private get subClientName(): string {
        return this.subpackage.name.pascalCase.safeName + "Client";
    }

    public generate(): RustFile {
        const filename = `${this.subpackage.name.snakeCase.safeName}.rs`;
        const endpoints = this.service?.endpoints || [];

        // Simple client generation - no bloat!
        const rustClient = rust.client({
            name: this.subClientName,
            methods: this.convertEndpointsToSimpleMethods(endpoints)
        });

        const fileContents = rustClient.toString();
        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src"),
            fileContents
        });
    }

    private convertEndpointsToSimpleMethods(endpoints: HttpEndpoint[]): any[] {
        return endpoints.map((endpoint) => ({
            name: endpoint.name.snakeCase.safeName,
            parameters: this.extractParametersFromEndpoint(endpoint).map(
                (param) =>
                    `${param.name}: ${param.isRef ? "&" : ""}${param.optional ? `Option<${param.type}>` : param.type}`
            ),
            returnType: "String"
        }));
    }

    private extractParametersFromEndpoint(endpoint: HttpEndpoint): any[] {
        const params: any[] = [];

        // Add path parameters
        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    params.push({
                        name: pathParam.name.snakeCase.safeName,
                        type: "String", // Simplified
                        isRef: true
                    });
                }
            }
        });

        // Add query parameters
        endpoint.queryParameters.forEach((queryParam) => {
            params.push({
                name: queryParam.name.name.snakeCase.safeName,
                type: "String", // Simplified
                optional: true,
                isRef: true
            });
        });

        return params;
    }
}
