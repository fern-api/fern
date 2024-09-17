import { php, PhpFile, FileGenerator } from "@fern-api/php-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        subpackage: Subpackage;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: php.ClassReference;
    private subpackage: Subpackage;

    constructor({ subpackage, context }: SubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.classReference
        });

        class_.addField(this.context.rawClient.getField());

        const subpackages = this.getSubpackages();
        class_.addConstructor(this.getConstructorMethod({ subpackages }));
        for (const subpackage of subpackages) {
            class_.addField(this.context.getSubpackageField(subpackage));
        }

        return new PhpFile({
            clazz: class_,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod({ subpackages }: { subpackages: Subpackage[] }): php.Class.Constructor {
        return {
            parameters: [
                php.parameter({
                    name: "$client",
                    type: php.Type.reference(this.context.rawClient.getClassReference())
                })
            ],
            body: php.codeblock((writer) => {
                writer.writeLine(`$this->client = $${this.context.rawClient.getFieldName()};`);

                for (const subpackage of subpackages) {
                    writer.write(`$this->${subpackage.name.camelCase.safeName} = `);
                    writer.writeNodeStatement(
                        php.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: [php.codeblock(`$this->${this.context.rawClient.getFieldName()}`)]
                        })
                    );
                }
            })
        };
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.getLocationForSubpackage(this.subpackage).directory,
            RelativeFilePath.of(this.classReference.name + ".php")
        );
    }
}
