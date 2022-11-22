import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";

export class NotWrappedEndpointRequest extends AbstractEndpointRequest {
    protected override getUrlPath(): ts.Expression {
        return this.getUrlPathForNoPathParameters();
    }

    protected override buildQueryParameters(): undefined {
        return undefined;
    }

    protected override getReferenceToRequestBodyInsideEndpoint(): ts.Expression {
        return this.getReferenceToRequestArgumentToEndpoint();
    }

    protected override getRequestParameterType(file: SdkFile): TypeReferenceNode | undefined {
        if (!this.hasRequestBody()) {
            return undefined;
        }
        return file.getReferenceToType(this.endpoint.request.type);
    }

    protected override generateTypeDeclaration(): void {}

    protected override getHeaders(): ts.PropertyAssignment[] {
        return [];
    }
}
