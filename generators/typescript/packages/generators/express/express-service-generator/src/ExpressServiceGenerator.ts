import { HttpService } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressService } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { GeneratedExpressServiceImpl } from "./GeneratedExpressServiceImpl";

export declare namespace ExpressServiceGenerator {
    export interface Init {
        doNotHandleUnrecognizedErrors: boolean;
        packageResolver: PackageResolver;
        includeSerdeLayer: boolean;
    }

    export namespace generateService {
        export interface Args {
            packageId: PackageId;
            service: HttpService;
            serviceClassName: string;
        }
    }
}

export class ExpressServiceGenerator {
    private doNotHandleUnrecognizedErrors: boolean;
    private packageResolver: PackageResolver;
    private includeSerdeLayer: boolean;

    constructor({ packageResolver, doNotHandleUnrecognizedErrors, includeSerdeLayer }: ExpressServiceGenerator.Init) {
        this.doNotHandleUnrecognizedErrors = doNotHandleUnrecognizedErrors;
        this.packageResolver = packageResolver;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateService({
        packageId,
        service,
        serviceClassName,
    }: ExpressServiceGenerator.generateService.Args): GeneratedExpressService {
        const package_ = this.packageResolver.resolvePackage(packageId);
        return new GeneratedExpressServiceImpl({
            packageId,
            package: package_,
            service,
            serviceClassName,
            doNotHandleUnrecognizedErrors: this.doNotHandleUnrecognizedErrors,
            includeSerdeLayer: this.includeSerdeLayer,
        });
    }
}
