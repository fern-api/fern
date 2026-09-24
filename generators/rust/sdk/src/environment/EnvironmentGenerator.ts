import { GeneratorError } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import {
    Attribute,
    CodeBlock,
    Enum,
    EnumVariant,
    Expression,
    ImplBlock,
    MatchArm,
    Method,
    Pattern,
    PUBLIC,
    Reference,
    rust,
    Statement,
    Struct,
    Type,
    UseStatement
} from "@fern-api/rust-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/** The default URL getter method name, used for single-URL environments or the primary URL */
export const DEFAULT_URL_METHOD = "url";

/** `Default::default()`; an inherent method of that name on the enum would take precedence over it */
const DEFAULT_TRAIT_METHOD = "default";

export declare namespace EnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
    }
}

export class EnvironmentGenerator {
    private readonly context: SdkGeneratorContext;

    constructor({ context }: EnvironmentGenerator.Args) {
        this.context = context;
    }

    /**
     * Returns the name of the URL getter method for a specific base URL ID in a multi-URL
     * environment. For example, if the base URL ID maps to "wss", returns "wss_url".
     * Returns "url" as fallback for single-URL environments or if the ID is not found.
     */
    public getUrlMethodNameForBaseUrlId(baseUrlId: string | undefined): string {
        const environmentsConfig = this.context.ir.environments;
        if (!environmentsConfig?.environments || !baseUrlId) {
            return DEFAULT_URL_METHOD;
        }

        return environmentsConfig.environments._visit({
            singleBaseUrl: () => DEFAULT_URL_METHOD,
            multipleBaseUrls: (config) => {
                const baseUrl = config.baseUrls.find((b) => b.id === baseUrlId);
                if (baseUrl) {
                    return this.getUrlMethodNameForBaseUrl(baseUrl);
                }
                return DEFAULT_URL_METHOD;
            },
            _other: () => DEFAULT_URL_METHOD
        });
    }

    /**
     * The URL getter method names of a multi-URL environment enum, for example
     * `["api_url", "auth_url"]`. Empty for single-URL environments.
     */
    public getMultiUrlGetterMethodNames(): string[] {
        return (
            this.visitMultipleBaseUrls((config) =>
                config.baseUrls.map((baseUrl) => this.getUrlMethodNameForBaseUrl(baseUrl))
            ) ?? []
        );
    }

    /**
     * The expression selecting one environment of a multi-URL enum: its constructor
     * (`Environment::staging()`) or, when the constructor name would collide with a URL getter,
     * the variant over its URL struct's `Default` (`Environment::Staging(StagingUrls::default())`).
     */
    public getMultiUrlEnvironmentSelector(environmentId: string): string | undefined {
        return this.visitMultipleBaseUrls((config) => {
            const env = config.environments.find((candidate) => candidate.id === environmentId);
            if (env == null) {
                return undefined;
            }
            const constructorName = this.getEnvironmentConstructorName(env, config);
            return constructorName != null
                ? `${this.getEnvironmentEnumName()}::${constructorName}()`
                : `${this.getEnvironmentEnumName()}::${this.variantOverDefaultUrls(env)}`;
        });
    }

    /**
     * The URL `Environment::default().url()` returns for a multi-URL enum, as a literal: the
     * primary URL of the configured default environment. Undefined for single-URL environments
     * or when no default environment is configured.
     */
    public getMultiUrlDefaultEnvironmentUrl(): string | undefined {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        if (defaultEnvironmentId == null) {
            return undefined;
        }
        return this.visitMultipleBaseUrls((config) => {
            const defaultEnv = config.environments.find((env) => env.id === defaultEnvironmentId);
            const primaryBaseUrl = config.baseUrls[0];
            if (defaultEnv == null || primaryBaseUrl == null) {
                return undefined;
            }
            return defaultEnv.urls[primaryBaseUrl.id];
        });
    }

    public generate(): RustFile | null {
        const environmentsConfig = this.context.ir.environments;
        if (!environmentsConfig?.environments) {
            return null;
        }

        return environmentsConfig.environments._visit({
            singleBaseUrl: (config) => this.generateSingleUrlEnvironment(config),
            multipleBaseUrls: (config) => this.generateMultiUrlEnvironment(config),
            _other: () => {
                throw GeneratorError.validationError("Unknown environments type: " + environmentsConfig.environments.type);
            }
        });
    }

    private generateSingleUrlEnvironment(config: FernIr.SingleBaseUrlEnvironments): RustFile {
        const useStatements = [
            new UseStatement({
                path: "serde",
                items: ["Deserialize", "Serialize"]
            })
        ];

        const environmentEnum = this.createEnvironmentEnum(config.environments);
        const implBlock = this.createEnvironmentImplBlock(config.environments);
        const defaultImplBlock = this.createDefaultImplBlock(config.environments);

        const module = rust.module({
            useStatements,
            rawDeclarations: [environmentEnum.toString(), implBlock.toString(), defaultImplBlock.toString()]
        });

        return new RustFile({
            filename: "environment.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: module.toString()
        });
    }

    private generateMultiUrlEnvironment(config: FernIr.MultipleBaseUrlsEnvironments): RustFile {
        const useStatements = [
            // Import serde directly rather than relying on the prelude re-export:
            // the CLI generator embeds this SDK and replaces src/prelude.rs with a
            // bare types-crate re-export that does not include the serde macros.
            new UseStatement({
                path: "serde",
                items: ["Deserialize", "Serialize"]
            })
        ];

        // Create URL structure for each environment, with its URLs embedded in `Default`
        const urlStructs = config.environments.flatMap((env) => [
            this.createUrlStruct(env, config.baseUrls),
            this.createUrlStructDefaultImplBlock(env, config.baseUrls)
        ]);

        // Create the main environment enum
        const environmentEnum = this.createMultiUrlEnvironmentEnum(config.environments);

        // Create impl block for environment methods
        const implBlock = this.createMultiUrlImplBlock(config);

        // Create Default impl block
        const defaultImplBlock = this.createMultiUrlDefaultImplBlock(config);

        const module = rust.module({
            useStatements,
            rawDeclarations: [
                ...urlStructs.map((struct) => struct.toString()),
                environmentEnum.toString(),
                implBlock.toString(),
                defaultImplBlock.toString()
            ]
        });

        return new RustFile({
            filename: "environment.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: module.toString()
        });
    }

    private createEnvironmentEnum(environments: FernIr.SingleBaseUrlEnvironment[]): Enum {
        const environmentEnumName = this.getEnvironmentEnumName();
        return rust.enum_({
            name: environmentEnumName,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Copy", "PartialEq", "Eq", "Serialize", "Deserialize"])],
            variants: environments.map((env) => this.createEnumVariant(env))
        });
    }

    private createEnumVariant(env: FernIr.SingleBaseUrlEnvironment): EnumVariant {
        const needsRename = this.context.case.pascalSafe(env.name) !== this.context.case.camelSafe(env.name);

        return rust.enumVariant({
            name: this.context.case.pascalSafe(env.name),
            attributes: needsRename ? [Attribute.serde.rename(this.context.case.camelSafe(env.name))] : []
        });
    }

    private createEnvironmentImplBlock(environments: FernIr.SingleBaseUrlEnvironment[]): ImplBlock {
        const urlMethod = this.createUrlMethod(environments);
        const environmentEnumName = this.getEnvironmentEnumName();

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            methods: [urlMethod]
        });
    }

    private createUrlMethod(environments: FernIr.SingleBaseUrlEnvironment[]): Method {
        // Create match arms for each environment using proper AST
        const matchArms = environments.map((env) => {
            const pattern = Pattern.variable(`Self::${this.context.case.pascalSafe(env.name)}`);
            const expression = Expression.stringLiteral(env.url);
            return MatchArm.withExpression(pattern, expression);
        });

        const matchStatement = Statement.matchEnhanced(Expression.self(), matchArms);

        return rust.method({
            name: "url",
            visibility: PUBLIC,
            parameters: [
                {
                    name: "self",
                    parameterType: Type.str(),
                    isSelf: true,
                    isRef: true
                }
            ],
            returnType: Type.reference(new Reference({ name: "&'static str" })),
            body: CodeBlock.fromStatements([matchStatement])
        });
    }

    private createDefaultImplBlock(environments: FernIr.SingleBaseUrlEnvironment[]): ImplBlock {
        const defaultEnvId = this.context.ir.environments?.defaultEnvironment;
        const defaultEnv = environments.find((env) => env.id === defaultEnvId) || environments[0];
        const environmentEnumName = this.getEnvironmentEnumName();

        if (!defaultEnv) {
            throw GeneratorError.validationError("No environments found for Default implementation");
        }

        const defaultMethod = rust.method({
            name: "default",
            parameters: [],
            returnType: Type.reference(new Reference({ name: "Self" })),
            body: CodeBlock.fromExpression(Expression.reference(`Self::${this.context.case.pascalSafe(defaultEnv.name)}`))
        });

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private createUrlStruct(env: FernIr.MultipleBaseUrlsEnvironment, baseUrls: FernIr.EnvironmentBaseUrlWithId[]): Struct {
        return rust.struct({
            name: this.getUrlStructName(env),
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize"])],
            fields: baseUrls.map((baseUrl) =>
                rust.field({
                    name: this.context.case.snakeSafe(baseUrl.name),
                    type: Type.string(),
                    visibility: PUBLIC
                })
            )
        });
    }

    /**
     * Embeds an environment's URLs as `impl Default for <Env>Urls`, so every environment can be
     * selected without retyping the URLs the generator was configured with.
     */
    private createUrlStructDefaultImplBlock(
        env: FernIr.MultipleBaseUrlsEnvironment,
        baseUrls: FernIr.EnvironmentBaseUrlWithId[]
    ): ImplBlock {
        const defaultMethod = rust.method({
            name: "default",
            parameters: [],
            returnType: Type.reference(new Reference({ name: "Self" })),
            body: CodeBlock.fromExpression(
                Expression.structConstruction(
                    "Self",
                    baseUrls.map((baseUrl) => ({
                        name: this.context.case.snakeSafe(baseUrl.name),
                        value: Expression.toString(Expression.stringLiteral(env.urls[baseUrl.id] ?? ""))
                    }))
                )
            )
        });

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: this.getUrlStructName(env) })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private createMultiUrlEnvironmentEnum(environments: FernIr.MultipleBaseUrlsEnvironment[]): Enum {
        const environmentEnumName = this.getEnvironmentEnumName();
        return rust.enum_({
            name: environmentEnumName,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize"])],
            variants: environments.map((env) =>
                rust.enumVariant({
                    name: this.context.case.pascalSafe(env.name),
                    data: [Type.reference(new Reference({ name: this.getUrlStructName(env) }))]
                })
            )
        });
    }

    private createMultiUrlImplBlock(config: FernIr.MultipleBaseUrlsEnvironments): ImplBlock {
        const constructors = this.createEnvironmentConstructors(config);
        const getUrlMethod = this.createMultiUrlGetUrlMethod(config);
        const perUrlMethods = this.createPerBaseUrlGetterMethods(config);
        const environmentEnumName = this.getEnvironmentEnumName();

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            methods: [...constructors, getUrlMethod, ...perUrlMethods]
        });
    }

    /**
     * One constructor per environment (`Environment::staging()`), built from that environment's
     * `<Env>Urls::default()`. An environment whose snake_case name would collide with a URL getter,
     * or with `default` (an inherent `default()` would shadow `Default::default()` for every
     * `Environment::default()` call), gets no constructor; `Environment::<Env>(<Env>Urls::default())`
     * still selects it.
     */
    private createEnvironmentConstructors(config: FernIr.MultipleBaseUrlsEnvironments): Method[] {
        return config.environments.flatMap((env) => {
            const name = this.getEnvironmentConstructorName(env, config);
            if (name == null) {
                return [];
            }
            return [
                rust.method({
                    name,
                    visibility: PUBLIC,
                    parameters: [],
                    returnType: Type.reference(new Reference({ name: "Self" })),
                    body: CodeBlock.fromExpression(Expression.raw(`Self::${this.variantOverDefaultUrls(env)}`))
                })
            ];
        });
    }

    private getEnvironmentConstructorName(
        env: FernIr.MultipleBaseUrlsEnvironment,
        config: FernIr.MultipleBaseUrlsEnvironments
    ): string | undefined {
        const name = this.context.case.snakeSafe(env.name);
        const reserved = [
            DEFAULT_URL_METHOD,
            DEFAULT_TRAIT_METHOD,
            ...config.baseUrls.map((baseUrl) => this.getUrlMethodNameForBaseUrl(baseUrl))
        ];
        return reserved.includes(name) ? undefined : name;
    }

    private variantOverDefaultUrls(env: FernIr.MultipleBaseUrlsEnvironment): string {
        return `${this.context.case.pascalSafe(env.name)}(${this.getUrlStructName(env)}::default())`;
    }

    private getUrlStructName(env: FernIr.MultipleBaseUrlsEnvironment): string {
        return `${this.context.case.pascalSafe(env.name)}Urls`;
    }

    private getUrlMethodNameForBaseUrl(baseUrl: FernIr.EnvironmentBaseUrlWithId): string {
        return `${this.context.case.snakeSafe(baseUrl.name)}_url`;
    }

    private visitMultipleBaseUrls<T>(visit: (config: FernIr.MultipleBaseUrlsEnvironments) => T): T | undefined {
        const environments = this.context.ir.environments?.environments;
        if (environments == null) {
            return undefined;
        }
        return environments._visit<T | undefined>({
            singleBaseUrl: () => undefined,
            multipleBaseUrls: visit,
            _other: () => undefined
        });
    }

    /**
     * Creates a getter method for each base URL in a multi-URL environment.
     * For example, if there are "rest" and "wss" base URLs, this generates
     * `rest_url(&self) -> &str` and `wss_url(&self) -> &str`.
     */
    private createPerBaseUrlGetterMethods(config: FernIr.MultipleBaseUrlsEnvironments): Method[] {
        return config.baseUrls.map((baseUrl) => {
            const fieldName = this.context.case.snakeSafe(baseUrl.name);
            const matchArms = config.environments.map((env) => {
                const pattern = Pattern.raw(`Self::${this.context.case.pascalSafe(env.name)}(urls)`);
                const expression = Expression.reference(`&urls.${fieldName}`);
                return MatchArm.withExpression(pattern, expression);
            });

            const matchStatement = Statement.matchEnhanced(Expression.self(), matchArms);

            return rust.method({
                name: this.getUrlMethodNameForBaseUrl(baseUrl),
                visibility: PUBLIC,
                parameters: [
                    {
                        name: "self",
                        parameterType: Type.str(),
                        isSelf: true,
                        isRef: true
                    }
                ],
                returnType: Type.reference(new Reference({ name: "&str" })),
                body: CodeBlock.fromStatements([matchStatement])
            });
        });
    }

    private createMultiUrlGetUrlMethod(config: FernIr.MultipleBaseUrlsEnvironments): Method {
        const matchArms = config.environments.map((env) => {
            // Use tuple pattern for tuple enum variants
            const pattern = Pattern.raw(`Self::${this.context.case.pascalSafe(env.name)}(urls)`);
            const firstBaseUrl = config.baseUrls[0];
            const fieldName = firstBaseUrl?.name != null ? this.context.case.snakeSafe(firstBaseUrl.name) : "default";
            // Need to add reference since we're borrowing from urls
            const expression = Expression.reference(`&urls.${fieldName}`);
            return MatchArm.withExpression(pattern, expression);
        });

        const matchStatement = Statement.matchEnhanced(Expression.self(), matchArms);

        return rust.method({
            name: "url",
            visibility: PUBLIC,
            parameters: [
                {
                    name: "self",
                    parameterType: Type.str(),
                    isSelf: true,
                    isRef: true
                }
            ],
            returnType: Type.reference(new Reference({ name: "&str" })),
            body: CodeBlock.fromStatements([matchStatement])
        });
    }

    private createMultiUrlDefaultImplBlock(config: FernIr.MultipleBaseUrlsEnvironments): ImplBlock {
        const defaultEnvId = this.context.ir.environments?.defaultEnvironment;
        const defaultEnv = config.environments.find((env) => env.id === defaultEnvId) || config.environments[0];
        const environmentEnumName = this.getEnvironmentEnumName();

        if (!defaultEnv) {
            throw GeneratorError.validationError("No environments found for Default implementation");
        }

        const defaultExpr = `Self::${this.variantOverDefaultUrls(defaultEnv)}`;

        const defaultMethod = rust.method({
            name: "default",
            parameters: [],
            returnType: Type.reference(new Reference({ name: "Self" })),
            body: CodeBlock.fromExpression(Expression.raw(defaultExpr))
        });

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private getEnvironmentEnumName(): string {
        return this.context.getEnvironmentEnumName();
    }
}
