import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { getRawClientConstructor } from "./rawClientConstructor.js";

export declare namespace RawServiceClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        /** Absent for the root package's own service. */
        subpackage?: FernIr.Subpackage;
    }
}

/**
 * The raw counterpart of a client that has endpoints.
 *
 * It holds exactly what an endpoint method reads - the shared `RawClient`, the client options
 * and, where they exist, the environment and the routing auth provider - and declares the same
 * endpoints. The only difference is what they return: `HttpResponse<T>` instead of `T`, so the
 * status and the headers survive the call instead of being read and discarded.
 *
 * Nested subpackages are deliberately not repeated here; a nested client is reached through the
 * plain tree and answers `withRawResponse()` itself.
 */
export class RawServiceClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly classReference: php.ClassReference;
    private readonly serviceId: FernIr.ServiceId;
    private readonly service: FernIr.HttpService;
    private readonly subpackage: FernIr.Subpackage | undefined;

    constructor({ context, serviceId, service, subpackage }: RawServiceClientGenerator.Args) {
        super(context);
        this.serviceId = serviceId;
        this.service = service;
        this.subpackage = subpackage;
        this.classReference =
            subpackage != null
                ? context.getRawSubpackageClassReference(subpackage)
                : context.getRawRootClientClassReference();
    }

    public doGenerate(): PhpFile {
        const plainClientName =
            this.subpackage != null
                ? this.context.getSubpackageClassReference(this.subpackage).name
                : this.context.getRootClientClassName();
        const class_ = php.class_({
            ...this.classReference,
            docs: `Endpoints of the ${plainClientName}, returning the response metadata alongside the deserialized body.`
        });

        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";

        class_.addField(
            php.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: this.context.getClientOptionsType(),
                docs: "@phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator"
            })
        );
        class_.addField(this.context.rawClient.getField());

        if (isMultiUrl) {
            class_.addField(
                php.field({
                    name: "$environment",
                    access: "private",
                    type: php.Type.reference(this.context.getEnvironmentsClassReference())
                })
            );
        }

        if (this.context.isEndpointSecurity()) {
            class_.addField(
                php.field({
                    name: "$routingAuthProvider",
                    access: "private",
                    type: php.Type.optional(php.Type.reference(this.context.getRoutingAuthProviderClassReference())),
                    docs: "@phpstan-ignore-next-line Property is read in endpoint methods"
                })
            );
        }

        class_.addConstructor(getRawClientConstructor({ context: this.context, isMultiUrl }));

        for (const endpoint of this.service.endpoints) {
            class_.addMethods(
                this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    endpoint,
                    raw: true
                })
            );
        }

        return new PhpFile({
            clazz: class_,
            directory: this.getDirectory(),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getDirectory(): RelativeFilePath {
        return this.subpackage != null
            ? this.context.getLocationForSubpackage(this.subpackage).directory
            : RelativeFilePath.of("");
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.classReference.name + ".php"));
    }
}
