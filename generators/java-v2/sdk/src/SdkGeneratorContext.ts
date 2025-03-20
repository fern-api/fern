import { camelCase } from "lodash-es";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { java } from "@fern-api/java-ast";
import { AbstractJavaGeneratorContext, JavaProject } from "@fern-api/java-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { JavaGeneratorAgent } from "./JavaGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends AbstractJavaGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: JavaGeneratorAgent;
    public readonly project: JavaProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new JavaProject({ context: this });
        this.generatorAgent = new JavaGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder()
        });
    }

    public getEnvironmentClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getEnvironmentClassName(),
            packageName: this.getCorePackageName()
        });
    }

    public getCorePackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        tokens.push("core");
        return this.joinPackageTokens(tokens);
    }

    public getEnvironmentClassName(): string {
        return "Environment";
    }

    public getRootClientClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRootClientClassName(),
            packageName: this.getRootPackageName()
        });
    }

    public getRootPackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        return this.joinPackageTokens(tokens);
    }

    private joinPackageTokens(tokens: string[]): string {
        const sanitizedTokens = tokens.map((token) => {
            return this.startsWithNumber(token) ? "_" + token : token;
        });
        return sanitizedTokens.join(".");
    }

    private startsWithNumber(token: string): boolean {
        return /^\d/.test(token);
    }

    private getPackagePrefixTokens(): string[] {
        if (this.customConfig?.["package-prefix"] != null) {
            return this.customConfig["package-prefix"].split(".");
        }
        const prefix: string[] = [];
        prefix.push("com");
        prefix.push(...this.splitOnNonAlphaNumericChar(this.config.organization));
        prefix.push(...this.splitOnNonAlphaNumericChar(this.getApiName()));
        return prefix;
    }

    private splitOnNonAlphaNumericChar(value: string): string[] {
        return value.split(/[^a-zA-Z0-9]/);
    }

    public getRootClientClassName(): string {
        return this.customConfig?.["client-class-name"] ?? `${this.getBaseNamePrefix()}Client`;
    }

    private getBaseNamePrefix(): string {
        return (
            this.convertKebabCaseToUpperCamelCase(this.config.organization) +
            this.convertKebabCaseToUpperCamelCase(this.getApiName())
        );
    }

    private getApiName(): string {
        return camelCase(this.config.workspaceName);
    }

    private convertKebabCaseToUpperCamelCase(kebab: string): string {
        return kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
    }
}
