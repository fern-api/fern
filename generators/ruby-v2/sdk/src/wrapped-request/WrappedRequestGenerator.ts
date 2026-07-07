import { getOriginalName } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { generateFields } from "@fern-api/ruby-model";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace WrappedRequestGenerator {
    export interface Args {
        serviceId: FernIr.ServiceId;
        wrapper: FernIr.SdkRequestWrapper;
        context: SdkGeneratorContext;
        endpoint: FernIr.HttpEndpoint;
    }
}

export class WrappedRequestGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private serviceId: FernIr.ServiceId;
    private wrapper: FernIr.SdkRequestWrapper;
    private endpoint: FernIr.HttpEndpoint;

    constructor({ serviceId, wrapper, context, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
        this.endpoint = endpoint;
    }

    protected doGenerate(): RubyFile {
        const properties: FernIr.ObjectProperty[] = [];

        const class_ = ruby.class_({
            name: this.case.pascalSafe(this.wrapper.wrapperName),
            superclass: this.context.getModelClassReference()
        });

        for (const pathParameter of this.endpoint.allPathParameters) {
            properties.push({
                ...pathParameter,
                name: {
                    name: pathParameter.name,
                    wireValue: getOriginalName(pathParameter.name)
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
                        wireValue: getOriginalName(this.wrapper.bodyKey)
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
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(class_, this.context.getModulesForServiceId(this.serviceId)).write(writer);
            }),
            directory: this.getFilepath(),
            filename: `${this.case.snakeSafe(this.wrapper.wrapperName)}.rb`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        const pkg = this.context.getPackageForServiceId(this.serviceId);
        const serviceDir = RelativeFilePath.of(
            [
                "lib",
                this.context.getRootFolderName(),
                ...pkg.fernFilepath.allParts.map((path) => this.case.snakeSafe(path)),
                "types"
            ].join("/")
        );
        return serviceDir;
    }
}
