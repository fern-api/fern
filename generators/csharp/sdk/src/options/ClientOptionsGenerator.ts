import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Name } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator, BASE_URL_FIELD_NAME, BASE_URL_SUMMARY, OptionArgs } from "./BaseOptionsGenerator";

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            partial: true,
            access: "public"
        });
        const optionArgs: OptionArgs = {
            optional: false,
            includeInitializer: true
        };
        class_.addField(this.getBaseUrlField());
        class_.addField(this.baseOptionsGenerator.getHttpClientField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getMaxRetriesField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getTimeoutField(optionArgs));
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory()
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${CLIENT_OPTIONS_CLASS_NAME}.cs`)
        );
    }

    private getBaseUrlField(): csharp.Field {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        let defaultEnvironment: Name | undefined = undefined;
        if (defaultEnvironmentId != null) {
            defaultEnvironment = this.context.ir.environments?.environments._visit({
                singleBaseUrl: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                multipleBaseUrls: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                _other: () => undefined
            });
        }

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return csharp.field({
                        access: "public",
                        name: BASE_URL_FIELD_NAME,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.string(),
                        summary: BASE_URL_SUMMARY,
                        initializer:
                            defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                                  })
                                : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                    });
                },
                multipleBaseUrls: () => {
                    return csharp.field({
                        access: "public",
                        name: "Environment",
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.reference(this.context.getEnvironmentsClassReference()),
                        summary: "The Environment for the API.",
                        initializer:
                            defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                                  })
                                : csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                    });
                },
                _other: () => undefined
            });
            if (field != null) {
                return field;
            }
        }

        return csharp.field({
            access: "public",
            name: BASE_URL_FIELD_NAME,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: csharp.Type.string(),
            summary: BASE_URL_SUMMARY,
            initializer:
                defaultEnvironment != null
                    ? csharp.codeblock((writer) => {
                          writer.writeNode(this.context.getEnvironmentsClassReference());
                          writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                      })
                    : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
        });
    }
}
