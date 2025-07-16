import { camelCase } from "lodash-es"

import { GeneratorNotificationService } from "@fern-api/base-generator"
import { assertNever } from "@fern-api/core-utils"
import { java } from "@fern-api/java-ast"
import { AbstractJavaGeneratorContext, JavaProject } from "@fern-api/java-base"

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk"
import {
    FernFilepath,
    HttpEndpoint,
    IntermediateRepresentation,
    Name,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api"

import { JavaGeneratorAgent } from "./JavaGeneratorAgent"
import { SdkCustomConfigSchema } from "./SdkCustomConfig"
import { TYPES_DIRECTORY } from "./constants"
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder"

export class SdkGeneratorContext extends AbstractJavaGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: JavaGeneratorAgent
    public readonly project: JavaProject

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService)
        this.project = new JavaProject({ context: this })
        this.generatorAgent = new JavaGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir: this.ir
        })
    }

    public getReturnTypeForEndpoint(httpEndpoint: HttpEndpoint): java.Type {
        const responseBody = httpEndpoint.response?.body

        if (responseBody == null) {
            return java.Type.void()
        }

        switch (responseBody.type) {
            case "json":
                return this.javaTypeMapper.convert({ reference: responseBody.value.responseBodyType })
            case "text":
                return java.Type.string()
            case "bytes":
                throw new Error("Returning bytes is not supported")
            case "streaming":
                switch (responseBody.value.type) {
                    case "text":
                        throw new Error("Returning streamed text is not supported")
                    case "json":
                        return java.Type.iterable(
                            this.javaTypeMapper.convert({ reference: responseBody.value.payload })
                        )
                    case "sse":
                        return java.Type.iterable(
                            this.javaTypeMapper.convert({ reference: responseBody.value.payload })
                        )
                    default:
                        assertNever(responseBody.value)
                }
                break
            case "fileDownload":
                return java.Type.inputStream()
            case "streamParameter":
                throw new Error("Returning stream parameter is not supported")
            default:
                assertNever(responseBody)
        }
    }

    public getPackageNameForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId)
        return this.getTypesPackageName(typeDeclaration.name.fernFilepath)
    }

    public getJavaClassReferenceFromDeclaration({
        typeDeclaration
    }: {
        typeDeclaration: TypeDeclaration
    }): java.ClassReference {
        return java.classReference({
            name: typeDeclaration.name.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(typeDeclaration.name.fernFilepath)
        })
    }

    public getTypesPackageName(fernFilePath: FernFilepath): string {
        return this.getResourcesPackage(fernFilePath, TYPES_DIRECTORY)
    }

    public getPaginationClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getPaginationClassName(),
            packageName: this.getPaginationPackageName()
        })
    }

    public getPaginationPackageName(): string {
        if (this.getPackageLayout() === "flat") {
            return this.getCorePackageName()
        }
        return this.getCorePackageName() + ".pagination"
    }

    public getPackageLayout(): string {
        return this.customConfig?.["package-layout"] ?? "nested"
    }

    public getPaginationClassName(): string {
        return "SyncPagingIterable"
    }

    public getOkHttpClientClassReference(): java.ClassReference {
        return java.classReference({
            name: "OkHttpClient",
            packageName: "okhttp3"
        })
    }

    public getRequestOptionsClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRequestOptionsClassName(),
            packageName: this.getCorePackageName()
        })
    }

    public getRequestOptionsClassName(): string {
        return "RequestOptions"
    }

    public getApiExceptionClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getApiExceptionClassName(),
            packageName: this.getCorePackageName()
        })
    }

    public getApiExceptionClassName(): string {
        return this.customConfig?.["base-api-exception-class-name"] ?? `${this.getBaseNamePrefix()}ApiException`
    }

    public getEnvironmentClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getEnvironmentClassName(),
            packageName: this.getCorePackageName()
        })
    }

    public getCorePackageName(): string {
        const tokens = this.getPackagePrefixTokens()
        tokens.push("core")
        return this.joinPackageTokens(tokens)
    }

    public getEnvironmentClassName(): string {
        return "Environment"
    }

    public getRootClientClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRootClientClassName(),
            packageName: this.getRootPackageName()
        })
    }

    public getRootPackageName(): string {
        const tokens = this.getPackagePrefixTokens()
        return this.joinPackageTokens(tokens)
    }

    public getRootClientClassName(): string {
        return this.customConfig?.["client-class-name"] ?? `${this.getBaseNamePrefix()}Client`
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false
    }

    private joinPackageTokens(tokens: string[]): string {
        const sanitizedTokens = tokens.map((token) => {
            return this.startsWithNumber(token) ? "_" + token : token
        })
        return sanitizedTokens.join(".")
    }

    private startsWithNumber(token: string): boolean {
        return /^\d/.test(token)
    }

    private getPackagePrefixTokens(): string[] {
        if (this.customConfig?.["package-prefix"] != null) {
            return this.customConfig["package-prefix"].split(".")
        }
        const prefix: string[] = []
        prefix.push("com")
        prefix.push(...this.splitOnNonAlphaNumericChar(this.config.organization))
        prefix.push(...this.splitOnNonAlphaNumericChar(this.getApiName()))
        return prefix
    }

    private splitOnNonAlphaNumericChar(value: string): string[] {
        return value.split(/[^a-zA-Z0-9]/)
    }

    private getBaseNamePrefix(): string {
        return (
            this.convertKebabCaseToUpperCamelCase(this.config.organization) +
            this.convertKebabCaseToUpperCamelCase(this.getApiName())
        )
    }

    private getApiName(): string {
        return camelCase(this.config.workspaceName)
    }

    private convertKebabCaseToUpperCamelCase(kebab: string): string {
        return kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase())
    }

    protected getResourcesPackage(fernFilepath: FernFilepath, suffix?: string): string {
        const tokens = this.getPackagePrefixTokens()
        switch (this.getPackageLayout()) {
            case "flat":
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.packagePath.map((name) => this.getPackageNameSegment(name)))
                }
                break
            case "nested":
            default:
                if (fernFilepath != null && fernFilepath.allParts.length > 0) {
                    tokens.push("resources")
                }
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.allParts.map((name) => this.getPackageNameSegment(name)))
                }
        }
        if (suffix != null) {
            tokens.push(suffix)
        }
        return this.joinPackageTokens(tokens)
    }

    private getPackageNameSegment(name: Name): string {
        return name.camelCase.safeName.toLowerCase()
    }
}
