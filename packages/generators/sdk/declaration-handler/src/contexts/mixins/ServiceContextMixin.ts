import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { GeneratedService } from "../../generated-types/GeneratedService";
import { Reference } from "../../Reference";

export interface ServiceContextMixin {
    getGeneratedService: (serviceName: DeclaredServiceName) => GeneratedService;
    getReferenceToService: (serviceName: DeclaredServiceName, options: { importAlias: string }) => Reference;
}

export interface WithServiceContextMixin {
    service: ServiceContextMixin;
}
