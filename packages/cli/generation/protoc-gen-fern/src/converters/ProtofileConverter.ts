import { camelCase } from "lodash-es";

import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "./ProtofileConverterContext";
import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";
import { ServiceConverter } from "./service/ServiceConverter";

export declare namespace ProtofileConverter {
    interface Args extends AbstractSpecConverter.Args<ProtofileConverterContext> {}
}

export class ProtofileConverter extends AbstractSpecConverter<ProtofileConverterContext, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: ProtofileConverter.Args) {
        super({ breadcrumbs, context, audiences });
    }

    public convert(): IntermediateRepresentation | undefined {
        this.convertOptions();
        this.convertEnumsAndMessages();
        this.convertServices();
        return this.finalizeIr();
    }

    private convertOptions() {
        // TODO: convert options
    }

    private convertEnumsAndMessages() {
        for (const schema of [...this.context.spec.enumType, ...this.context.spec.messageType]) {
            const enumOrMessageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, this.context.spec.package],
                schema
            });
            const convertedEnum = enumOrMessageConverter.convert();
            if (convertedEnum != null) {
                this.addTypesToIr({
                    ...convertedEnum.inlinedTypes,
                    [schema.name]: convertedEnum.convertedSchema
                });
            }
        }
    }

    private convertServices() {
        for (const service of this.context.spec.service) {
            const serviceConverter = new ServiceConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                service
            });
            const convertedService = serviceConverter.convert();
            if (convertedService != null) {
                for (const endpoint of convertedService.endpoints) {
                    this.addEndpointToIr({
                        endpointGroup: endpoint.group,
                        endpoint: endpoint.endpoint,
                        audiences: [],
                        serviceName: convertedService.serviceName
                    });
                }
            }
        }
    }

    protected addEndpointToIr({
        endpoint,
        audiences,
        endpointGroup,
        endpointGroupDisplayName,
        serviceName
    }: {
        endpoint: FernIr.HttpEndpoint;
        audiences: string[];
        endpointGroup?: string[];
        endpointGroupDisplayName?: string;
        serviceName?: string;
    }): void {
        const group = this.context.getGroup({
            groupParts: endpointGroup,
            namespace: this.context.namespace
        });

        const pkg = this.getOrCreatePackage({ group: endpointGroup });

        const allParts = [...group].map((part) => this.context.casingsGenerator.generateName(part));
        const finalpart = allParts[allParts.length - 1];

        if (pkg.service == null) {
            pkg.service = serviceName ?? `service_${group.map((part) => camelCase(part)).join("/")}`;
        }

        if (this.ir.services[pkg.service] == null) {
            this.ir.services[pkg.service] = this.createNewService({ allParts, finalpart, endpointGroupDisplayName });
        }
        this.ir.services[pkg.service]?.endpoints.push(endpoint);

        const service = this.ir.services[pkg.service];
        if (service != null) {
            this.irGraph.addEndpoint(service, endpoint);
            // TODO: This method should be "markEndpointsForAudience"
            this.irGraph.markEndpointForAudience(service.name, [endpoint], audiences);
        }
    }

    protected getOrCreatePackage({ group }: { group?: string[] }): Package {
        const groupParts = [];
        if (this.context.namespace != null) {
            groupParts.push(this.context.namespace);
        }
        groupParts.push(...(group ?? []));

        if (groupParts.length == 0) {
            return this.ir.rootPackage;
        }

        let pkg = this.ir.rootPackage;
        for (let i = 0; i < groupParts.length; i++) {
            const name = groupParts[i] ?? "";
            const groupPartsSubset = groupParts.slice(0, i + 1);
            const subpackageId = `subpackage_${groupPartsSubset.join("/")}`;
            if (this.ir.subpackages[subpackageId] == null) {
                this.ir.subpackages[subpackageId] = {
                    name: this.context.casingsGenerator.generateName(name),
                    ...this.createPackage({ name })
                };
            }
            const curr = this.ir.subpackages[subpackageId];
            if (!pkg.subpackages.includes(subpackageId)) {
                pkg.subpackages.push(subpackageId);
            }
            pkg = curr;
        }
        return pkg;
    }
}
