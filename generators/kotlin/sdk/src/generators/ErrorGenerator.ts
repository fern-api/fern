import { RelativeFilePath } from "@fern-api/fs-utils";
import { KotlinFile as AstKotlinFile, Class, Property, Type, Function, Parameter } from "@fern-api/kotlin-ast";
import { KotlinFile } from "@fern-api/kotlin-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ErrorGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public async generate(): Promise<void> {
        this.context.logger.info("Generating error types...");

        const packageName = this.context.getPackageName();

        const baseException = this.generateBaseException(packageName);
        this.context.project.addFile(baseException);

        for (const [errorId, errorDeclaration] of Object.entries(this.context.ir.errors)) {
            const file = this.generateErrorType(errorDeclaration, packageName);
            this.context.project.addFile(file);
        }
    }

    private generateBaseException(packageName: string): KotlinFile {
        const baseExceptionClass = new Class({
            name: "ApiException",
            extends: new Type({ name: "RuntimeException" }),
            constructorParameters: [
                new Parameter({
                    name: "message",
                    type: Type.string(),
                    modifiers: ["override"]
                }),
                new Parameter({
                    name: "cause",
                    type: Type.any(true),
                    defaultValue: "null"
                })
            ],
            docs: "Base exception for all API errors"
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [baseExceptionClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/ApiException.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private generateErrorType(errorDeclaration: any, packageName: string): KotlinFile {
        const errorName = errorDeclaration.name.name.pascalCase.safeName + "Error";

        const errorClass = new Class({
            name: errorName,
            extends: new Type({ name: "ApiException" }),
            constructorParameters: [
                new Parameter({
                    name: "message",
                    type: Type.string()
                })
            ],
            docs: errorDeclaration.docs ?? undefined
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [errorClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${errorName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }
}
