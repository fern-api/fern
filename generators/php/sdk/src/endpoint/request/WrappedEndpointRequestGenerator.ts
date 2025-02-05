import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, FileLocation, PhpFile, php } from "@fern-api/php-codegen";

import {
    FileProperty,
    FilePropertyArray,
    FilePropertySingle,
    HttpEndpoint,
    InlinedRequestBodyProperty,
    ObjectProperty,
    SdkRequestWrapper,
    ServiceId
} from "@fern-fern/ir-sdk/api";

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
            parentClassReference: this.context.getJsonSerializableTypeClassReference()
        });

        const service = this.context.getHttpServiceOrThrow(this.serviceId);
        for (const header of [...service.headers, ...this.endpoint.headers]) {
            clazz.addField(
                php.field({
                    name: this.context.getPropertyName(header.name.name),
                    type: this.context.phpTypeMapper.convert({ reference: header.valueType }),
                    access: "public",
                    docs: header.docs
                })
            );
        }

        for (const query of this.endpoint.queryParameters) {
            const type = query.allowMultiple
                ? php.Type.array(this.context.phpTypeMapper.convert({ reference: query.valueType }))
                : this.context.phpTypeMapper.convert({ reference: query.valueType });
            clazz.addField(
                php.field({
                    name: this.context.getPropertyName(query.name.name),
                    type,
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
                        type: this.context.phpTypeMapper.convert({ reference: reference.requestBodyType }),
                        access: "public",
                        docs: reference.docs
                    })
                );
            },
            inlinedRequestBody: (request) => {
                for (const property of request.properties) {
                    clazz.addField(this.inlinePropertyToField({ property }));
                }
                for (const property of request.extendedProperties ?? []) {
                    clazz.addField(this.inlinePropertyToField({ property, inherited: true }));
                }
                for (const declaredTypeName of request.extends) {
                    clazz.addTrait(this.context.phpTypeMapper.convertToTraitClassReference(declaredTypeName));
                }
            },
            fileUpload: (fileUpload) => {
                for (const property of fileUpload.properties) {
                    switch (property.type) {
                        case "file": {
                            clazz.addField(this.filePropertyToField(property.value));
                            break;
                        }
                        case "bodyProperty": {
                            clazz.addField(this.inlinePropertyToField({ property }));
                            break;
                        }
                        default: {
                            assertNever(property);
                        }
                    }
                }
            },
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

    private filePropertyToField(fileProperty: FileProperty): php.Field {
        let type;
        switch (fileProperty.type) {
            case "file": {
                type = php.Type.reference(this.context.getFileClassReference());
                break;
            }
            case "fileArray": {
                type = php.Type.array(php.Type.reference(this.context.getFileClassReference()));
                break;
            }
            default: {
                assertNever(fileProperty);
            }
        }
        return php.field({
            name: this.context.getPropertyName(fileProperty.key.name),
            type: fileProperty.isOptional ? php.Type.optional(type) : type,
            access: "public"
        });
    }

    private inlinePropertyToField({
        property,
        inherited
    }: {
        property: InlinedRequestBodyProperty;
        inherited?: boolean;
    }): php.Field {
        const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
        return php.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: "public",
            docs: property.docs,
            attributes: this.context.phpAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
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
