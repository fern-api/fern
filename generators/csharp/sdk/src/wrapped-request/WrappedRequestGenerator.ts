import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { getUndiscriminatedUnionSerializerAnnotation } from "@fern-api/fern-csharp-model";
import { SnippetHelper } from "@fern-api/fern-csharp-model/src/SnippetHelper";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Name } from "@fern-api/ir-sdk/lib/sdk/api/resources/commons/types/Name";
import { ExampleEndpointCall } from "@fern-api/ir-sdk/lib/sdk/api/resources/http/types/ExampleEndpointCall";
import { ExampleTypeReference } from "@fern-api/ir-sdk/lib/sdk/api/resources/types/types/ExampleTypeReference";
import { HttpEndpoint, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";
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

export class WrappedRequestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference;
    private wrapper: SdkRequestWrapper;
    private serviceId: ServiceId;
    private endpoint: HttpEndpoint;
    private snippetHelper: SnippetHelper;

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
        this.endpoint = endpoint;
        this.snippetHelper = new SnippetHelper(context);
    }

    protected doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: "public",
            record: true
        });

        for (const query of this.endpoint.queryParameters) {
            class_.addField(
                csharp.field({
                    name: query.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: query.valueType }),
                    access: "public",
                    get: true,
                    init: true,
                    summary: query.docs,
                    useRequired: true
                })
            );
        }

        for (const header of this.endpoint.headers) {
            class_.addField(
                csharp.field({
                    name: header.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                    access: "public",
                    get: true,
                    init: true,
                    summary: header.docs,
                    useRequired: true
                })
            );
        }

        const addJsonAnnotations = this.endpoint.queryParameters.length === 0 && this.endpoint.headers.length === 0;

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                class_.addField(
                    csharp.field({
                        name: this.wrapper.bodyKey.pascalCase.safeName,
                        type: this.context.csharpTypeMapper.convert({ reference: reference.requestBodyType }),
                        access: "public",
                        get: true,
                        init: true,
                        summary: reference.docs,
                        useRequired: true
                    })
                );
            },
            inlinedRequestBody: (request) => {
                // TODO(dsinghvi): handle extends of inlined request bodies
                for (const property of request.properties) {
                    const annotations: csharp.Annotation[] = [];
                    const maybeUndiscriminatedUnion = this.context.getAsUndiscriminatedUnionTypeDeclaration(
                        property.valueType
                    );
                    if (addJsonAnnotations && maybeUndiscriminatedUnion != null) {
                        annotations.push(
                            getUndiscriminatedUnionSerializerAnnotation({
                                context: this.context,
                                undiscriminatedUnionDeclaration: maybeUndiscriminatedUnion.declaration,
                                isList: maybeUndiscriminatedUnion.isList
                            })
                        );
                    }

                    class_.addField(
                        csharp.field({
                            name: property.name.name.pascalCase.safeName,
                            type: this.context.csharpTypeMapper.convert({ reference: property.valueType }),
                            access: "public",
                            get: true,
                            init: true,
                            summary: property.docs,
                            jsonPropertyName: addJsonAnnotations ? property.name.wireValue : undefined,
                            annotations,
                            useRequired: true
                        })
                    );
                }
            },
            fileUpload: () => undefined,
            bytes: () => undefined,
            _other: () => undefined
        });
        return new CSharpFile({
            clazz: class_,
            directory: this.getDirectory()
        });
    }

    public doGenerateSnippet(example: ExampleEndpointCall): csharp.CodeBlock {
        const orderedFields: { name: Name; value: ExampleTypeReference }[] = [];
        for (const exampleQueryParameter of example.queryParameters) {
            orderedFields.push({ name: exampleQueryParameter.name.name, value: exampleQueryParameter.value });
        }

        for (const header of example.endpointHeaders) {
            orderedFields.push({ name: header.name.name, value: header.value });
        }

        example.request?._visit({
            reference: (reference) => {
                orderedFields.push({ name: this.wrapper.bodyKey, value: reference });
            },
            inlinedRequestBody: (inlinedRequestBody) => {
                for (const property of inlinedRequestBody.properties) {
                    orderedFields.push({ name: property.name.name, value: property.value });
                }
            },
            _other: () => undefined
        });
        const args = orderedFields
            .map(({ name, value }) => {
                const assignment = this.snippetHelper.getSnippetForTypeReference(value);
                if (assignment === undefined) {
                    return null;
                }
                return {
                    name: name.pascalCase.safeName,
                    assignment
                };
            })
            .filter((value): value is { name: string; assignment: csharp.CodeBlock } => value != null);
        const instantiateClass = csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            this.getDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }

    private getDirectory(): RelativeFilePath {
        const directory = this.context.getDirectoryForServiceId(this.serviceId);
        return RelativeFilePath.of(directory ? `${directory}/Requests` : "Requests");
    }
}
