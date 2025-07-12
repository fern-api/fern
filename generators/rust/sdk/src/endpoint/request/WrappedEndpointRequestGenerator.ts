import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, FileLocation, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import {
    FileProperty,
    HttpEndpoint,
    InlinedRequestBodyProperty,
    Name,
    QueryParameter,
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
    RustFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private wrapper: SdkRequestWrapper;
    private serviceId: ServiceId;
    private endpoint: HttpEndpoint;
    private classReference: rust.ClassReference;
    private location: FileLocation;

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedEndpointRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.endpoint = endpoint;
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
        this.location = this.context.getLocationForWrappedRequest(this.serviceId);
    }

    protected doGenerate(): RustFile {
        const clazz = rust.dataClass({
            ...this.classReference,
            parentClassReference: this.context.getJsonSerializableTypeClassReference()
        });

        const service = this.context.getHttpServiceOrThrow(this.serviceId);
        const { includeGetters, includeSetters } = {
            includeGetters: this.context.shouldGenerateGetterMethods(),
            includeSetters: this.context.shouldGenerateSetterMethods()
        };

        const includePathParameters = this.context.includePathParametersInWrappedRequest({
            endpoint: this.endpoint,
            wrapper: this.wrapper
        });
        if (includePathParameters) {
            for (const pathParameter of this.endpoint.allPathParameters) {
                this.addFieldWithMethods({
                    clazz,
                    name: pathParameter.name,
                    field: rust.field({
                        name: this.context.getPropertyName(pathParameter.name),
                        type: this.context.rustTypeMapper.convert({ reference: pathParameter.valueType }),
                        access: this.context.getPropertyAccess(),
                        docs: pathParameter.docs
                    }),
                    includeGetters,
                    includeSetters
                });
            }
        }

        for (const query of this.endpoint.queryParameters) {
            this.addFieldWithMethods({
                clazz,
                name: query.name.name,
                field: rust.field({
                    name: this.context.getPropertyName(query.name.name),
                    type: this.getQueryParameterType(query),
                    access: this.context.getPropertyAccess(),
                    docs: query.docs
                }),
                includeGetters,
                includeSetters
            });
        }

        for (const header of [...service.headers, ...this.endpoint.headers]) {
            this.addFieldWithMethods({
                clazz,
                name: header.name.name,
                field: rust.field({
                    name: this.context.getPropertyName(header.name.name),
                    type: this.context.rustTypeMapper.convert({ reference: header.valueType }),
                    access: this.context.getPropertyAccess(),
                    docs: header.docs
                }),
                includeGetters,
                includeSetters
            });
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                this.addFieldWithMethods({
                    clazz,
                    name: this.wrapper.bodyKey,
                    field: rust.field({
                        name: this.context.getPropertyName(this.wrapper.bodyKey),
                        type: this.context.rustTypeMapper.convert({ reference: reference.requestBodyType }),
                        access: this.context.getPropertyAccess(),
                        docs: reference.docs
                    }),
                    includeGetters,
                    includeSetters
                });
            },
            inlinedRequestBody: (request) => {
                for (const property of request.properties) {
                    this.addFieldWithMethods({
                        clazz,
                        name: property.name.name,
                        field: this.inlinePropertyToField({ property }),
                        includeGetters,
                        includeSetters
                    });
                }
                for (const property of request.extendedProperties ?? []) {
                    clazz.addField(this.inlinePropertyToField({ property, inherited: true }));
                }
                for (const declaredTypeName of request.extends) {
                    clazz.addTrait(this.context.rustTypeMapper.convertToTraitClassReference(declaredTypeName));
                }
            },
            fileUpload: (fileUpload) => {
                for (const property of fileUpload.properties) {
                    switch (property.type) {
                        case "file": {
                            this.addFieldWithMethods({
                                clazz,
                                name: property.value.key.name,
                                field: this.filePropertyToField(property.value),
                                includeGetters,
                                includeSetters
                            });
                            break;
                        }
                        case "bodyProperty": {
                            this.addFieldWithMethods({
                                clazz,
                                name: property.name.name,
                                field: this.inlinePropertyToField({ property }),
                                includeGetters,
                                includeSetters
                            });
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

        return new RustFile({
            clazz,
            directory: this.location.directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private filePropertyToField(fileProperty: FileProperty): rust.Field {
        let type;
        switch (fileProperty.type) {
            case "file": {
                type = rust.Type.reference(this.context.getFileClassReference());
                break;
            }
            case "fileArray": {
                type = rust.Type.array(rust.Type.reference(this.context.getFileClassReference()));
                break;
            }
            default: {
                assertNever(fileProperty);
            }
        }
        return rust.field({
            name: this.context.getPropertyName(fileProperty.key.name),
            type: fileProperty.isOptional ? rust.Type.optional(type) : type,
            access: this.context.getPropertyAccess()
        });
    }

    private inlinePropertyToField({
        property,
        inherited
    }: {
        property: InlinedRequestBodyProperty;
        inherited?: boolean;
    }): rust.Field {
        const convertedType = this.context.rustTypeMapper.convert({ reference: property.valueType });
        return rust.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: this.context.getPropertyAccess(),
            docs: property.docs,
            attributes: this.context.rustAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
        });
    }

    private getQueryParameterType(query: QueryParameter): rust.Type {
        if (query.allowMultiple) {
            if (this.context.isOptional(query.valueType)) {
                return rust.Type.optional(
                    rust.Type.array(
                        this.context.rustTypeMapper.convert({
                            reference: this.context.dereferenceOptional(query.valueType)
                        })
                    )
                );
            }
            return rust.Type.array(
                this.context.rustTypeMapper.convert({
                    reference: query.valueType
                })
            );
        }
        return this.context.rustTypeMapper.convert({ reference: query.valueType });
    }

    private addFieldWithMethods({
        clazz,
        name,
        field,
        includeGetters,
        includeSetters
    }: {
        clazz: rust.DataClass;
        name: Name;
        field: rust.Field;
        includeGetters: boolean;
        includeSetters: boolean;
    }): void {
        if (includeGetters) {
            clazz.addMethod(this.context.getGetterMethod({ name, field }));
        }
        if (includeSetters) {
            clazz.addMethod(this.context.getSetterMethod({ name, field }));
        }
        clazz.addField(field);
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceDirectory(),
            this.location.directory,
            RelativeFilePath.of(this.classReference.name + ".php")
        );
    }
}
