import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { generateFields } from "@fern-api/ruby-model";
import { HttpEndpoint, ObjectProperty, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace WrappedRequestGenerator {
    export interface Args {
        serviceId: ServiceId;
        wrapper: SdkRequestWrapper;
        context: SdkGeneratorContext;
        endpoint: HttpEndpoint;
    }
}

export class WrappedRequestGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;
    private endpoint: HttpEndpoint;

    constructor({ serviceId, wrapper, context, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
        this.endpoint = endpoint;
    }

    protected doGenerate(): RubyFile {
        const properties: ObjectProperty[] = [];

        const class_ = ruby.class_({
            name: this.wrapper.wrapperName.pascalCase.safeName,
            superclass: ruby.classReference({
                name: "Model",
                modules: ["Internal", "Types"]
            })
        });

        for (const pathParameter of this.endpoint.allPathParameters) {
            properties.push({
                ...pathParameter,
                name: {
                    name: pathParameter.name,
                    wireValue: pathParameter.name.originalName
                },
                propertyAccess: undefined,
                availability: undefined
            });
        }

        for (const queryParameter of this.endpoint.queryParameters) {
            properties.push({
                ...queryParameter,
                propertyAccess: undefined,
                availability: undefined
            });
        }

        for (const header of this.endpoint.headers) {
            properties.push({
                ...header,
                propertyAccess: undefined,
                availability: undefined
            });
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                properties.push({
                    name: {
                        name: this.wrapper.bodyKey,
                        wireValue: this.wrapper.bodyKey.originalName
                    },
                    valueType: reference.requestBodyType,
                    propertyAccess: undefined,
                    availability: undefined,
                    v2Examples: reference.v2Examples,
                    docs: reference.docs
                });
            },
            inlinedRequestBody: (request) => {
                for (const property of [...request.properties, ...(request.extendedProperties ?? [])]) {
                    properties.push({
                        ...property,
                        propertyAccess: undefined
                    });
                }
            },
            fileUpload: () => undefined,
            bytes: () => undefined,
            _other: () => undefined
        });

        const statements = generateFields({
            properties,
            context: this.context
        });

        class_.addStatements(statements);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                ruby.wrapInModules(class_, this.getModules()).write(writer);
            }),
            directory: this.getFilepath(),
            filename: `${this.wrapper.wrapperName.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        const subpackage = this.context.getSubpackageForServiceId(this.serviceId);
        const serviceDir = RelativeFilePath.of(
            [
                "lib",
                this.context.getRootFolderName(),
                ...subpackage.fernFilepath.allParts.map((path) => path.snakeCase.safeName),
                "types"
            ].join("/")
        );
        return serviceDir;
    }

    protected getModules(): ruby.Module_[] {
        return [
            this.context.getRootModule(),
            ...this.context
                .getSubpackageForServiceId(this.serviceId)
                .fernFilepath.allParts.map((part) => ruby.module({ name: part.pascalCase.safeName })),
            this.context.getTypesModule()
        ];
    }
}
