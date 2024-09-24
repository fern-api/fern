import { php, PhpFile, FileGenerator, FileLocation } from "@fern-api/php-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ContainerType, HttpEndpoint, SdkRequestWrapper, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";
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
        const clazz = php.dataClass({
            ...this.classReference,
            parentClassReference: this.context.getSerializableTypeClassReference()
        });

        const service = this.context.getHttpServiceOrThrow(this.serviceId);
        for (const header of [...service.headers, ...this.endpoint.headers]) {
            clazz.addField(
                php.field({
                    name: this.context.getPropertyName(header.name.name),
                    ...this.getTypeAndConstructorEnumType(header.valueType),
                    access: "public",
                    docs: header.docs
                })
            );
        }

        for (const query of this.endpoint.queryParameters) {
            const typeReference = query.allowMultiple
                ? TypeReference.container(ContainerType.list(query.valueType))
                : query.valueType;
            clazz.addField(
                php.field({
                    name: this.context.getPropertyName(query.name.name),
                    ...this.getTypeAndConstructorEnumType(typeReference),
                    access: "public",
                    docs: query.docs
                })
            );
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                clazz.addField(
                    php.field({
                        name: this.context.getPropertyName(this.wrapper.bodyKey),
                        ...this.getTypeAndConstructorEnumType(reference.requestBodyType),
                        access: "public",
                        docs: reference.docs
                    })
                );
            },
            inlinedRequestBody: (request) => {
                for (const property of request.properties) {
                    const type = this.context.phpTypeMapper.convert({ reference: property.valueType });
                    clazz.addField(
                        php.field({
                            name: this.context.getPropertyName(property.name.name),
                            ...this.getTypeAndConstructorEnumType(property.valueType),
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
            clazz,
            directory: this.location.directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getTypeAndConstructorEnumType(typeReference: TypeReference): {
        type: php.Type;
        constructorEnumType: php.Type | undefined;
    } {
        const type = this.context.phpTypeMapper.convert({ reference: typeReference, preserveEnumType: true });
        const internalType = type.underlyingType().internalType;
        const isEnum = internalType.type === "reference" && internalType.isEnum;
        if (isEnum) {
            this.context.logger.error("IS ENUM!");
            console.log("IS ENUM!");
        } else {
            this.context.logger.error("IS NOT ENUM!");
            console.log("IS NOT ENUM!");
        }
        const strippedEnumsType = isEnum
            ? this.context.phpTypeMapper.convert({
                  reference: typeReference,
                  preserveEnumType: false
              })
            : undefined;
        return {
            type: strippedEnumsType ?? type,
            constructorEnumType: isEnum ? type : undefined
        };
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceDirectory(),
            this.location.directory,
            RelativeFilePath.of(this.classReference.name + ".php")
        );
    }
}
