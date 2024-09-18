import { php, PhpFile, FileGenerator, FileLocation } from "@fern-api/php-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpEndpoint, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../../SdkCustomConfig";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace WrappedEndpointRequestGenerator {
    export interface Args {
        serviceId: ServiceId;
        wrapper: SdkRequestWrapper;
        context: SdkGeneratorContext;
        endpoint: HttpEndpoint;
    }
}

export class WrappedEndpointRequestGenerator extends FileGenerator<
    PhpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private wrapper: SdkRequestWrapper;
    private serviceId: ServiceId;
    private endpoint: HttpEndpoint;
    private classReference: php.ClassReference;
    private location: FileLocation;

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedEndpointRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.endpoint = endpoint;
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
        this.location = this.context.getLocationForWrappedRequest(this.serviceId);
    }

    protected doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.classReference
        });

        for (const query of this.endpoint.queryParameters) {
            const type = query.allowMultiple
                ? php.Type.array(this.context.phpTypeMapper.convert({ reference: query.valueType }))
                : this.context.phpTypeMapper.convert({ reference: query.valueType });

            class_.addField(
                php.field({
                    name: this.context.getPropertyName(query.name.name),
                    type,
                    access: "public",
                    docs: query.docs
                })
            );
        }

        const service = this.context.getHttpServiceOrThrow(this.serviceId);
        for (const header of [...service.headers, ...this.endpoint.headers]) {
            class_.addField(
                php.field({
                    name: this.context.getPropertyName(header.name.name),
                    type: this.context.phpTypeMapper.convert({ reference: header.valueType }),
                    access: "public",
                    docs: header.docs
                })
            );
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                class_.addField(
                    php.field({
                        name: this.context.getPropertyName(this.wrapper.bodyKey),
                        type: this.context.phpTypeMapper.convert({ reference: reference.requestBodyType }),
                        access: "public",
                        docs: reference.docs
                    })
                );
            },
            inlinedRequestBody: (request) => {
                for (const property of [...request.properties, ...(request.extendedProperties ?? [])]) {
                    const type = this.context.phpTypeMapper.convert({ reference: property.valueType });
                    class_.addField(
                        php.field({
                            name: this.context.getPropertyName(property.name.name),
                            type,
                            access: "public",
                            docs: property.docs,
                            attributes: this.context.phpAttributeMapper.convert({ type, property })
                        })
                    );
                }
            },
            fileUpload: () => undefined,
            bytes: () => undefined,
            _other: () => undefined
        });

        return new PhpFile({
            clazz: class_,
            directory: this.location.directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceDirectory(),
            this.location.directory,
            RelativeFilePath.of(this.classReference.name + ".php")
        );
    }
}
