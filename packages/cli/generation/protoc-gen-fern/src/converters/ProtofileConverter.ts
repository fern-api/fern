import { camelCase } from "lodash-es";

import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";
import { AbstractSpecConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "./ProtofileConverterContext";
import { EnumOrMessageConverter } from "./message/EnumOrMessageConverter";
import { ServiceConverter } from "./service/ServiceConverter";
import { PATH_FIELD_NUMBERS, SOURCE_CODE_INFO_PATH_STARTERS } from "./utils/PathFieldNumbers";

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
        for (const [index, schema] of this.context.spec.enumType.entries()) {
            const enumConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, this.context.spec.package],
                schema,
                sourceCodeInfoPath: [SOURCE_CODE_INFO_PATH_STARTERS.ENUM, index],
                schemaIndex: index
            });
            const convertedEnum = enumConverter.convert();
            if (convertedEnum != null) {
                this.addTypesToIr({
                    ...convertedEnum.inlinedTypes,
                    [this.context.maybePrependPackageName(schema.name)]: convertedEnum.convertedSchema
                });
            }
        }

        for (const [index, schema] of this.context.spec.messageType.entries()) {
            const messageConverter = new EnumOrMessageConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, this.context.spec.package],
                schema,
                sourceCodeInfoPath: [SOURCE_CODE_INFO_PATH_STARTERS.MESSAGE, index],
                schemaIndex: index
            });
            const convertedMessage = messageConverter.convert();
            if (convertedMessage != null) {
                this.addTypesToIr({
                    ...convertedMessage.inlinedTypes,
                    [this.context.maybePrependPackageName(schema.name)]: convertedMessage.convertedSchema
                });
            }
        }
    }

    private convertServices() {
        for (const [index, service] of this.context.spec.service.entries()) {
            const serviceConverter = new ServiceConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                service,
                sourceCodeInfoPath: [SOURCE_CODE_INFO_PATH_STARTERS.SERVICE, index]
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
