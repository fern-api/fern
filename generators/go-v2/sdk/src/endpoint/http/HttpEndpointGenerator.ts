import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";

export declare namespace EndpointGenerator {
    export interface Args {
        endpoint: HttpEndpoint;
    }
}

export class HttpEndpointGenerator extends AbstractEndpointGenerator {
    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
    }

    public generate({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        subpackage: Subpackage | undefined;
        endpoint: HttpEndpoint;
    }): go.Method[] {
        const methods: go.Method[] = [];
        return methods;
    }

    public generateRaw({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        subpackage: Subpackage | undefined;
        endpoint: HttpEndpoint;
    }): go.Method[] {
        return [this.generateRawUnaryEndpoint({ serviceId, service, subpackage, endpoint })];
    }

    private generateRawUnaryEndpoint({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        subpackage: Subpackage | undefined;
        endpoint: HttpEndpoint;
    }): go.Method {
        const signature = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        return new go.Method({
            name: this.context.getMethodName(endpoint.name),
            parameters: signature.allParameters,
            return_: signature.returnTypes,
            body: this.getRawUnaryEndpointBody({ endpoint, returnZeroValues: signature.returnZeroValues }),
            typeReference: this.getRawClientTypeReference({ subpackage })
        });
    }

    private getRawClientTypeReference({ subpackage }: { subpackage: Subpackage | undefined }): go.TypeReference {
        if (subpackage == null) {
            return this.context.getRootRawClientClassReference();
        }
        return this.context.getSubpackageRawClientClassReference(subpackage);
    }

    private getRawUnaryEndpointBody({
        endpoint,
        returnZeroValues
    }: {
        endpoint: HttpEndpoint;
        returnZeroValues: go.TypeInstantiation[];
    }): go.CodeBlock {
        return this.writeReturnZeroValues({ returnZeroValues });
    }

    private writeReturnZeroValues({ returnZeroValues }: { returnZeroValues: go.TypeInstantiation[] }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`return `);
            returnZeroValues.forEach((zeroValue, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.writeNode(zeroValue);
            });
        });
    }
}
