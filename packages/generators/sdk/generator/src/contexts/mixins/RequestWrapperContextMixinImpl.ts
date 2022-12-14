import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { RequestWrapperContextMixin } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace RequestWrapperContextMixinImpl {
    export interface Init {
        requestWrapperGenerator: RequestWrapperGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        serviceResolver: ServiceResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class RequestWrapperContextMixinImpl implements RequestWrapperContextMixin {
    private requestWrapperGenerator: RequestWrapperGenerator;
    private requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        requestWrapperGenerator,
        requestWrapperDeclarationReferencer,
        serviceResolver,
        importsManager,
        sourceFile,
    }: RequestWrapperContextMixinImpl.Init) {
        this.requestWrapperGenerator = requestWrapperGenerator;
        this.requestWrapperDeclarationReferencer = requestWrapperDeclarationReferencer;
        this.serviceResolver = serviceResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedRequestWrapper(
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId
    ): GeneratedRequestWrapper {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.requestWrapperGenerator.generateRequestWrapper({
            service: service.originalService,
            endpoint,
            wrapperName: this.requestWrapperDeclarationReferencer.getExportedName({
                serviceName: service.originalService.name,
                endpoint,
            }),
        });
    }

    public getReferenceToRequestWrapper(serviceName: DeclaredServiceName, endpointId: HttpEndpointId): ts.TypeNode {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.requestWrapperDeclarationReferencer.getReferenceToRequestWrapperType({
            name: {
                serviceName: service.originalService.name,
                endpoint,
            },
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
        });
    }
}
