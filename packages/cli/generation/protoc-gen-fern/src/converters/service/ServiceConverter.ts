import { ServiceDescriptorProto } from "@bufbuild/protobuf/wkt";

import * as FernIr from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { MethodConverter } from "./MethodConverter";

export declare namespace ServiceConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        service: ServiceDescriptorProto;
    }

    export interface Output {
        endpoints: MethodConverter.Output[];
        serviceName: string;
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class ServiceConverter extends AbstractConverter<ProtofileConverterContext, ServiceConverter.Output> {
    private readonly service: ServiceDescriptorProto;
    constructor({ context, breadcrumbs, service }: ServiceConverter.Args) {
        super({ context, breadcrumbs });
        this.service = service;
    }

    public convert(): ServiceConverter.Output | undefined {
        const rpcServiceMethods: MethodConverter.Output[] = [];
        for (const rpcMethod of this.service.method) {
            const methodConverter = new MethodConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                operation: rpcMethod
            });
            const convertedMethod = methodConverter.convert();
            if (convertedMethod != null) {
                rpcServiceMethods.push(convertedMethod);
            }
        }
        return {
            endpoints: rpcServiceMethods,
            serviceName: this.service.name,
            inlinedTypes: {}
        };
    }
}
