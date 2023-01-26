import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { ExpressInlinedRequestBodyContextMixin, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";

export declare namespace ExpressInlinedRequestBodyContextMixinImpl {
    export interface Init {
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        serviceResolver: ServiceResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class ExpressInlinedRequestBodyContextMixinImpl implements ExpressInlinedRequestBodyContextMixin {
    private expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
    private expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        expressInlinedRequestBodyGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        serviceResolver,
        importsManager,
        sourceFile,
    }: ExpressInlinedRequestBodyContextMixinImpl.Init) {
        this.expressInlinedRequestBodyGenerator = expressInlinedRequestBodyGenerator;
        this.expressInlinedRequestBodyDeclarationReferencer = expressInlinedRequestBodyDeclarationReferencer;
        this.serviceResolver = serviceResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedInlinedRequestBody(
        service: FernFilepath,
        endpointName: Name
    ): GeneratedExpressInlinedRequestBody {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return this.expressInlinedRequestBodyGenerator.generateInlinedRequestBody({
            requestBody: endpoint.requestBody,
            typeName: this.expressInlinedRequestBodyDeclarationReferencer.getExportedName({
                service,
                endpoint,
            }),
        });
    }

    public getReferenceToInlinedRequestBodyType(service: FernFilepath, endpointName: Name): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressInlinedRequestBodyDeclarationReferencer.getReferenceToInlinedRequestBody({
            name: { service, endpoint },
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
        });
    }
}
