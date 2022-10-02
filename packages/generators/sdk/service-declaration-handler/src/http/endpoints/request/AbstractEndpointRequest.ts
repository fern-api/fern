import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { Fetcher, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import urlJoin from "url-join";
import { Client } from "../../Client";
import { AbstractEndpointDeclaration } from "../AbstractEndpointDeclaration";
import { WireBodySchema } from "../WireBodySchema";

export interface EndpointRequest {
    generate({ endpointFile, schemaFile }: { endpointFile: SdkFile; schemaFile: SdkFile }): void;
    getRequestParameter(file: SdkFile): { name: string; type: TypeReferenceNode } | undefined;
    buildFetcherArgs(file: SdkFile): {
        statements: ts.Statement[];
        fetcherArgs: Fetcher.Args;
    };
}

export abstract class AbstractEndpointRequest extends AbstractEndpointDeclaration implements EndpointRequest {
    private static ENDPOINT_REQUEST_PARAMETER_NAME = "request";
    private static SCHEMA_TYPE_NAME = "Request";

    private schema: WireBodySchema | undefined;

    constructor(init: AbstractEndpointDeclaration.Init) {
        super(init);
        this.schema = WireBodySchema.of({
            typeName: AbstractEndpointRequest.SCHEMA_TYPE_NAME,
            type: init.endpoint.request.type,
            serviceName: init.service.name,
            endpoint: init.endpoint,
        });
    }

    public generate({ endpointFile, schemaFile }: { endpointFile: SdkFile; schemaFile: SdkFile }): void {
        this.generateTypeDeclaration(endpointFile);
        this.schema?.writeSchemaToFile(schemaFile);
    }

    protected abstract generateTypeDeclaration(file: SdkFile): void;

    public getRequestParameter(file: SdkFile): { name: string; type: TypeReferenceNode } | undefined {
        const type = this.getRequestParameterType(file);
        if (type == null) {
            return undefined;
        }
        return {
            name: AbstractEndpointRequest.ENDPOINT_REQUEST_PARAMETER_NAME,
            type,
        };
    }

    protected getReferenceToRequestArgumentToEndpoint(): ts.Identifier {
        return ts.factory.createIdentifier(AbstractEndpointRequest.ENDPOINT_REQUEST_PARAMETER_NAME);
    }

    protected abstract getRequestParameterType(file: SdkFile): TypeReferenceNode | undefined;

    public buildFetcherArgs(file: SdkFile): {
        statements: ts.Statement[];
        fetcherArgs: Fetcher.Args;
    } {
        const statements: ts.Statement[] = [];

        const queryParameters = this.buildQueryParameters(file);
        if (queryParameters != null) {
            statements.push(...queryParameters.statements);
        }

        return {
            statements,
            fetcherArgs: {
                url: file.externalDependencies.urlJoin.invoke([Client.getReferenceToOrigin(), this.getUrlPath(file)]),
                method: ts.factory.createStringLiteral(this.endpoint.method),
                headers: [...Client.getAuthHeaders(file), ...this.getHeaders()],
                queryParameters: queryParameters?.referenceToUrlParams,
                body: this.hasRequestBody() ? this.getReferenceToRequestBodyInsideEndpoint(file) : undefined,
                timeoutMs: undefined,
            },
        };
    }

    protected abstract getUrlPath(file: SdkFile): ts.Expression;

    protected abstract buildQueryParameters(
        file: SdkFile
    ): { statements: ts.Statement[]; referenceToUrlParams: ts.Expression } | undefined;

    protected abstract getReferenceToRequestBodyInsideEndpoint(file: SdkFile): ts.Expression | undefined;

    protected getReferenceToSchema(file: SdkFile): Zurg.Schema {
        if (this.schema != null) {
            return this.schema.getReferenceToSchema(file);
        }
        return file.getSchemaOfTypeReference(this.endpoint.request.type);
    }

    protected hasRequestBody(): boolean {
        return this.endpoint.request.type._type !== "void";
    }

    protected getUrlPathForNoPathParameters(): ts.Expression {
        if (this.service.basePathV2 != null && this.service.basePathV2.parts.length > 0) {
            throw new Error("Service base path contains parameters, but no path-parameters were specified");
        }
        if (this.endpoint.path.parts.length > 0) {
            throw new Error("Endpoint path contains parameters, but no path-parameters were specified");
        }
        if (this.service.basePathV2 == null) {
            return ts.factory.createStringLiteral(this.endpoint.path.head);
        }
        return ts.factory.createStringLiteral(urlJoin(this.service.basePathV2.head, this.endpoint.path.head));
    }

    protected abstract getHeaders(): ts.PropertyAssignment[];
}
