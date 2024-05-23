import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
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

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
        this.endpoint = endpoint;
    }

    protected doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: "public"
        });

        for (const query of this.endpoint.queryParameters) {
            class_.addField(
                csharp.field({
                    name: query.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: query.valueType }),
                    access: "public",
                    get: true,
                    init: true,
                    summary: query.docs
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
                    summary: header.docs
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
                        summary: reference.docs
                    })
                );
            },
            inlinedRequestBody: (request) => {
                // TODO(dsinghvi): handle extends of inlined request bodies
                for (const property of request.properties) {
                    class_.addField(
                        csharp.field({
                            name: property.name.name.pascalCase.safeName,
                            type: this.context.csharpTypeMapper.convert({ reference: property.valueType }),
                            access: "public",
                            get: true,
                            init: true,
                            summary: property.docs,
                            jsonPropertyName: addJsonAnnotations ? property.name.wireValue : undefined
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
            directory: RelativeFilePath.of(`${this.context.getDirectoryForServiceId(this.serviceId)}/requests`)
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(`${this.context.getDirectoryForServiceId(this.serviceId)}/requests`),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
