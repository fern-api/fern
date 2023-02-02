import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { ExpressServiceContextMixin, GeneratedExpressService } from "@fern-typescript/contexts";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { ExpressServiceDeclarationReferencer } from "../../declaration-referencers/ExpressServiceDeclarationReferencer";

export declare namespace ExpressServiceContextMixinImpl {
    export interface Init {
        expressServiceGenerator: ExpressServiceGenerator;
        expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
        serviceResolver: ServiceResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class ExpressServiceContextMixinImpl implements ExpressServiceContextMixin {
    private expressServiceGenerator: ExpressServiceGenerator;
    private expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        expressServiceGenerator,
        expressServiceDeclarationReferencer,
        serviceResolver,
        importsManager,
        sourceFile,
    }: ExpressServiceContextMixinImpl.Init) {
        this.expressServiceGenerator = expressServiceGenerator;
        this.expressServiceDeclarationReferencer = expressServiceDeclarationReferencer;
        this.serviceResolver = serviceResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedExpressService(service: DeclaredServiceName): GeneratedExpressService {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        return this.expressServiceGenerator.generateService({
            service: serviceDeclaration,
            serviceClassName: this.expressServiceDeclarationReferencer.getExportedNameOfService(
                serviceDeclaration.name
            ),
        });
    }

    public getReferenceToExpressService(
        service: DeclaredServiceName,
        { importAlias }: { importAlias: string }
    ): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        return this.expressServiceDeclarationReferencer.getReferenceToService({
            name: serviceDeclaration.name,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
            referencedIn: this.sourceFile,
        });
    }
}
