import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { ExpressServiceContext, GeneratedExpressService } from "@fern-typescript/contexts";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { ExpressServiceDeclarationReferencer } from "../../declaration-referencers/ExpressServiceDeclarationReferencer";

export declare namespace ExpressServiceContextImpl {
    export interface Init {
        expressServiceGenerator: ExpressServiceGenerator;
        expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
        packageResolver: PackageResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class ExpressServiceContextImpl implements ExpressServiceContext {
    private expressServiceGenerator: ExpressServiceGenerator;
    private expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        expressServiceGenerator,
        expressServiceDeclarationReferencer,
        packageResolver,
        importsManager,
        sourceFile
    }: ExpressServiceContextImpl.Init) {
        this.expressServiceGenerator = expressServiceGenerator;
        this.expressServiceDeclarationReferencer = expressServiceDeclarationReferencer;
        this.packageResolver = packageResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedExpressService(packageId: PackageId): GeneratedExpressService {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        return this.expressServiceGenerator.generateService({
            packageId,
            service: serviceDeclaration,
            serviceClassName: this.expressServiceDeclarationReferencer.getExportedNameOfService(packageId)
        });
    }

    public getReferenceToExpressService(packageId: PackageId, { importAlias }: { importAlias: string }): Reference {
        return this.expressServiceDeclarationReferencer.getReferenceToService({
            name: packageId,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
            referencedIn: this.sourceFile
        });
    }
}
