import { ServiceDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ProtobufService } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v3-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { PATH_FIELD_NUMBERS } from "../utils/PathFieldNumbers";
import { MethodConverter } from "./MethodConverter";

export declare namespace ServiceConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        service: ServiceDescriptorProto;
        sourceCodeInfoPath: number[];
    }

    export interface Output {
        endpoints: MethodConverter.Output[];
        serviceName: string;
        serviceDisplayName: string;
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class ServiceConverter extends AbstractConverter<ProtofileConverterContext, ServiceConverter.Output> {
    private readonly service: ServiceDescriptorProto;
    private readonly sourceCodeInfoPath: number[];
    constructor({ context, breadcrumbs, service, sourceCodeInfoPath }: ServiceConverter.Args) {
        super({ context, breadcrumbs });
        this.service = service;
        this.sourceCodeInfoPath = sourceCodeInfoPath;
    }

    public convert(): ServiceConverter.Output | undefined {
        const protobufService: ProtobufService = {
            file: {
                filepath: this.context.spec.name,
                packageName: this.context.spec.package || undefined,
                options: undefined
            },
            name: this.context.casingsGenerator.generateName(this.service.name)
        };

        const rpcServiceMethods: MethodConverter.Output[] = [];
        for (const [index, rpcMethod] of this.service.method.entries()) {
            const methodConverter = new MethodConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                operation: rpcMethod,
                serviceName: this.service.name,
                sourceCodeInfoPath: [...this.sourceCodeInfoPath, PATH_FIELD_NUMBERS.SERVICE.METHOD, index],
                protobufService
            });
            const convertedMethod = methodConverter.convert();
            if (convertedMethod != null) {
                rpcServiceMethods.push(convertedMethod);
            }
        }
        return {
            endpoints: rpcServiceMethods,
            serviceName: this.context.maybePrependPackageName(this.service.name),
            serviceDisplayName: this.service.name,
            inlinedTypes: {}
        };
    }
}
