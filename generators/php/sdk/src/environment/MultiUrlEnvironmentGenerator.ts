import { CaseConverter } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace MultiUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        multiUrlEnvironments: FernIr.MultipleBaseUrlsEnvironments;
    }
}

export class MultiUrlEnvironmentGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly case: CaseConverter;
    private multiUrlEnvironments: FernIr.MultipleBaseUrlsEnvironments;

    constructor({ context, multiUrlEnvironments }: MultiUrlEnvironmentGenerator.Args) {
        super(context);
        this.case = context.case;
        this.multiUrlEnvironments = multiUrlEnvironments;
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: this.context.getEnvironmentsClassReference().name,
            namespace: this.context.getRootNamespace(),
            docs: "Represents the available environments for the API with multiple base URLs."
        });

        class_.addConstructor({
            access: "private",
            parameters: this.getConstructorParameters(),
            body: php.codeblock((writer) => {
                for (const baseUrl of this.multiUrlEnvironments.baseUrls) {
                    const propertyName = this.getBaseUrlPropertyName(this.case.camelSafe(baseUrl.name));
                    writer.writeLine(`$this->${propertyName} = $${propertyName};`);
                }
            })
        });

        for (const baseUrl of this.multiUrlEnvironments.baseUrls) {
            const propertyName = this.getBaseUrlPropertyName(this.case.camelSafe(baseUrl.name));
            class_.addField(
                php.field({
                    access: "public",
                    name: `$${propertyName}`,
                    type: php.Type.string(),
                    readonly_: true
                })
            );
        }

        for (const environment of this.multiUrlEnvironments.environments) {
            const methodName = this.context.getEnvironmentName(environment.name);
            const docs = environment.docs ?? `${methodName} environment`;

            class_.addMethod(
                php.method({
                    access: "public",
                    name: methodName,
                    static_: true,
                    parameters: [],
                    return_: php.Type.reference(this.context.getEnvironmentsClassReference()),
                    docs,
                    body: php.codeblock((writer) => {
                        writer.write("return new self(");
                        writer.indent();
                        writer.newLine();
                        this.multiUrlEnvironments.baseUrls.forEach((baseUrl, index) => {
                            const propertyName = this.getBaseUrlPropertyName(this.case.camelSafe(baseUrl.name));
                            const url = environment.urls[baseUrl.id];
                            writer.write(`${propertyName}: '${url}'`);
                            if (index < this.multiUrlEnvironments.baseUrls.length - 1) {
                                writer.write(",");
                            }
                            writer.newLine();
                        });
                        writer.dedent();
                        writer.writeLine(");");
                    })
                })
            );
        }

        class_.addMethod(
            php.method({
                access: "public",
                name: "custom",
                static_: true,
                return_: php.Type.reference(this.context.getEnvironmentsClassReference()),
                parameters: this.getConstructorParameters(),
                docs: "Create a custom environment with your own URLs",
                body: php.codeblock((writer) => {
                    writer.write("return new self(");
                    writer.indent();
                    writer.newLine();
                    this.multiUrlEnvironments.baseUrls.forEach((baseUrl, index) => {
                        const propertyName = this.getBaseUrlPropertyName(this.case.camelSafe(baseUrl.name));
                        writer.write(`${propertyName}: $${propertyName}`);
                        if (index < this.multiUrlEnvironments.baseUrls.length - 1) {
                            writer.write(",");
                        }
                        writer.newLine();
                    });
                    writer.dedent();
                    writer.writeLine(");");
                })
            })
        );

        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.php`)
        );
    }

    private getConstructorParameters(): php.Parameter[] {
        return this.multiUrlEnvironments.baseUrls.map((baseUrl) => {
            const propertyName = this.getBaseUrlPropertyName(this.case.camelSafe(baseUrl.name));
            return php.parameter({
                name: propertyName,
                type: php.Type.string(),
                docs: `The ${this.case.camelSafe(baseUrl.name)} base URL`
            });
        });
    }

    private getBaseUrlPropertyName(name: string): string {
        return name;
    }
}
