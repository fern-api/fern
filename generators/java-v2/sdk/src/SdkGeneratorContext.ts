import { GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { java } from "@fern-api/java-ast";
import { AbstractJavaGeneratorContext } from "@fern-api/java-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    ExampleEndpointCall,
    FernFilepath,
    HttpEndpoint,
    IntermediateRepresentation,
    Name,
    Pagination,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { camelCase } from "lodash-es";
import { TYPES_DIRECTORY } from "./constants";
import { JavaGeneratorAgent } from "./JavaGeneratorAgent";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";
import { EndpointSnippetsGenerator } from "./reference/EndpointSnippetsGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractJavaGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: JavaGeneratorAgent;
    public readonly snippetGenerator: EndpointSnippetsGenerator;
    private paginationPackageCache?: string;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.snippetGenerator = new EndpointSnippetsGenerator({ context: this });
        this.generatorAgent = new JavaGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir: this.ir
        });
    }

    public getReturnTypeForEndpoint(httpEndpoint: HttpEndpoint): java.Type {
        if (httpEndpoint.pagination != null) {
            // For custom pagination, return CustomPager with the response type
            if (httpEndpoint.pagination.type === "custom") {
                const responseBody = httpEndpoint.response?.body;
                if (responseBody && responseBody.type === "json") {
                    const responseType = this.javaTypeMapper.convert({
                        reference: responseBody.value.responseBodyType
                    });
                    return java.Type.generic(
                        java.classReference({
                            name: this.getPaginationClassName(httpEndpoint.pagination),
                            packageName: this.getPaginationPackageName()
                        }),
                        [responseType]
                    );
                }
            }

            const itemType = this.getPaginationItemType(httpEndpoint.pagination);

            if (itemType) {
                return java.Type.generic(
                    java.classReference({
                        name: this.getPaginationClassName(httpEndpoint.pagination),
                        packageName: this.getPaginationPackageName()
                    }),
                    [itemType]
                );
            }
        }

        const responseBody = httpEndpoint.response?.body;

        if (responseBody == null) {
            return java.Type.void();
        }

        switch (responseBody.type) {
            case "json":
                return this.javaTypeMapper.convert({ reference: responseBody.value.responseBodyType });
            case "text":
                return java.Type.string();
            case "bytes":
                throw new Error("Returning bytes is not supported");
            case "streaming":
                switch (responseBody.value.type) {
                    case "text":
                        throw new Error("Returning streamed text is not supported");
                    case "json":
                        return java.Type.iterable(
                            this.javaTypeMapper.convert({ reference: responseBody.value.payload })
                        );
                    case "sse":
                        return java.Type.iterable(
                            this.javaTypeMapper.convert({ reference: responseBody.value.payload })
                        );
                    default:
                        assertNever(responseBody.value);
                        throw new Error("Unknown streaming type");
                }
            case "fileDownload":
                return java.Type.inputStream();
            case "streamParameter":
                throw new Error("Returning stream parameter is not supported");
            default:
                assertNever(responseBody);
        }
    }

    public getPackageNameForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getTypesPackageName(typeDeclaration.name.fernFilepath);
    }

    public getJavaClassReferenceFromDeclaration({
        typeDeclaration
    }: {
        typeDeclaration: TypeDeclaration;
    }): java.ClassReference {
        return java.classReference({
            name: typeDeclaration.name.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(typeDeclaration.name.fernFilepath)
        });
    }

    public getTypesPackageName(fernFilePath: FernFilepath): string {
        return this.getResourcesPackage(fernFilePath, TYPES_DIRECTORY);
    }

    public getPaginationClassReference(paginationType?: Pagination): java.ClassReference {
        return java.classReference({
            name: this.getPaginationClassName(paginationType),
            packageName: this.getPaginationPackageName()
        });
    }

    public getPaginationPackageName(): string {
        if (this.paginationPackageCache != null) {
            return this.paginationPackageCache;
        }

        if (this.getPackageLayout() === "flat") {
            this.paginationPackageCache = this.getCorePackageName();
            return this.paginationPackageCache;
        }

        const corePackage = this.getCorePackageName();

        const hasPaginatedEndpoints = this.hasPaginatedEndpoints();

        if (!hasPaginatedEndpoints) {
            // No pagination needed, default to core package
            this.paginationPackageCache = corePackage;
            return this.paginationPackageCache;
        }

        if (this.shouldUseCorePackageForPagination()) {
            this.paginationPackageCache = corePackage;
            return this.paginationPackageCache;
        }

        this.paginationPackageCache = corePackage + ".pagination";
        return this.paginationPackageCache;
    }

    public getPackageLayout(): string {
        return this.customConfig?.["package-layout"] ?? "nested";
    }

    /**
     * Checks if the IR contains any paginated endpoints.
     */
    private hasPaginatedEndpoints(): boolean {
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.pagination != null) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Determines if pagination classes should be placed in the core package
     * rather than a dedicated pagination subpackage. This handles cases like Auth0
     * where the SDK structure expects pagination classes in the core package.
     */
    private shouldUseCorePackageForPagination(): boolean {
        const packageName = this.getRootPackageName();

        const coreFirstPatterns = [/\.auth0\./i, /\.core\./i, /\.client\./i, /management/i, /authentication/i];

        if (coreFirstPatterns.some((pattern) => pattern.test(packageName))) {
            return true;
        }

        const serviceCount = Object.keys(this.ir.services).length;
        const serviceNames = Object.values(this.ir.services).map(
            (service) => service.name?.fernFilepath?.allParts?.map((part) => part.originalName).join("") || ""
        );

        if (
            serviceCount <= 2 ||
            serviceNames.every((name) =>
                ["management", "auth", "api", "client", "core"].some((generic) => name.toLowerCase().includes(generic))
            )
        ) {
            return true;
        }

        return false;
    }

    public getPaginationClassName(paginationType?: Pagination): string {
        if (paginationType?.type === "custom") {
            // Use the custom pager name from config if available
            return this.customConfig?.["custom-pager-name"] ?? "CustomPager";
        }
        return "SyncPagingIterable";
    }

    public getOkHttpClientClassReference(): java.ClassReference {
        return java.classReference({
            name: "OkHttpClient",
            packageName: "okhttp3"
        });
    }

    public getRequestOptionsClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRequestOptionsClassName(),
            packageName: this.getCorePackageName()
        });
    }

    public getRequestOptionsClassName(): string {
        return "RequestOptions";
    }

    public getApiExceptionClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getApiExceptionClassName(),
            packageName: this.getCorePackageName()
        });
    }

    public getApiExceptionClassName(): string {
        return this.customConfig?.["base-api-exception-class-name"] ?? `${this.getBaseNamePrefix()}ApiException`;
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

    public getRootClientClassName(): string {
        return this.customConfig?.["client-class-name"] ?? `${this.getBaseNamePrefix()}Client`;
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
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

    protected getResourcesPackage(fernFilepath: FernFilepath, suffix?: string): string {
        const tokens = this.getPackagePrefixTokens();
        switch (this.getPackageLayout()) {
            case "flat":
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.packagePath.map((name) => this.getPackageNameSegment(name)));
                }
                break;
            case "nested":
            default:
                if (fernFilepath != null && fernFilepath.allParts.length > 0) {
                    tokens.push("resources");
                }
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.allParts.map((name) => this.getPackageNameSegment(name)));
                }
        }
        if (suffix != null) {
            tokens.push(suffix);
        }
        return this.joinPackageTokens(tokens);
    }

    private getPackageNameSegment(name: Name): string {
        return name.camelCase.safeName.toLowerCase();
    }

    public getExampleEndpointCallOrThrow(endpoint: HttpEndpoint): ExampleEndpointCall {
        // Try user-specified examples first
        if (endpoint.userSpecifiedExamples.length > 0) {
            const exampleEndpointCall = endpoint.userSpecifiedExamples[0]?.example;
            if (exampleEndpointCall != null) {
                return exampleEndpointCall;
            }
        }
        // Fall back to auto-generated examples
        const exampleEndpointCall = endpoint.autogeneratedExamples[0]?.example;
        if (exampleEndpointCall == null) {
            throw new Error(`No example found for endpoint ${endpoint.id}`);
        }
        return exampleEndpointCall;
    }

    private getPaginationItemType(pagination: Pagination): java.Type | undefined {
        if (pagination.type === "cursor") {
            const resultsProperty = pagination.results;
            if (resultsProperty?.property?.valueType) {
                return this.extractPaginationItemType(resultsProperty.property.valueType);
            }
        } else if (pagination.type === "offset") {
            const resultsProperty = pagination.results;
            if (resultsProperty?.property?.valueType) {
                return this.extractPaginationItemType(resultsProperty.property.valueType);
            }
        } else if (pagination.type === "custom") {
            // For custom pagination, we need to extract the item type from the response
            // Custom pagination typically returns the full response object,
            // so we return undefined here to let the generator handle it differently
            return undefined;
        }
        return undefined;
    }

    private extractPaginationItemType(valueType: TypeReference): java.Type | undefined {
        if (!valueType) {
            return undefined;
        }

        // If it's a list container, extract the item type
        if (valueType.type === "container" && valueType.container) {
            if (valueType.container.type === "list" && valueType.container.list) {
                const innerType = valueType.container.list;
                return this.javaTypeMapper.convert({ reference: innerType });
            } else if (valueType.container.type === "optional" && valueType.container.optional) {
                return this.extractPaginationItemType(valueType.container.optional);
            }
        }

        if (valueType.type === "named" && valueType.typeId) {
            const typeDecl = this.ir.types[valueType.typeId];
            if (typeDecl?.shape.type === "object") {
                // Look for the first list property in the object
                for (const prop of typeDecl.shape.properties) {
                    const itemType = this.extractPaginationItemType(prop.valueType);
                    if (itemType) {
                        return itemType;
                    }
                }
            }
        }

        return undefined;
    }
}
