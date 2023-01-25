import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, RequestWrapperContextMixin } from "@fern-typescript/contexts";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";

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

    public getGeneratedRequestWrapper(service: FernFilepath, endpointName: Name): GeneratedRequestWrapper {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        if (serviceDeclaration.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = serviceDeclaration.originalService.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.requestWrapperGenerator.generateRequestWrapper({
            service: serviceDeclaration.originalService,
            endpoint,
            wrapperName: this.requestWrapperDeclarationReferencer.getExportedName({
                service,
                endpoint,
            }),
        });
    }

    public getReferenceToRequestWrapper(service: FernFilepath, endpointName: Name): ts.TypeNode {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        if (serviceDeclaration.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = serviceDeclaration.originalService.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.requestWrapperDeclarationReferencer.getReferenceToRequestWrapperType({
            name: { service, endpoint },
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
        });
    }
}
