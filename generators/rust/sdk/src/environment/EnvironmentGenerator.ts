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
import { ServerVariableOption, getServerVariableOptions, urlTemplateToFormatExpression } from "./serverVariables.js";

/** The default URL getter method name, used for single-URL environments or the primary URL */
export const DEFAULT_URL_METHOD = "url";

/** Resolves a single-URL environment's URL with server URL variables substituted in. */
export const URL_WITH_VARIABLES_METHOD = "url_with_variables";

/** Returns a multi-URL environment with server URL variables substituted into every URL. */
export const WITH_URL_VARIABLES_METHOD = "with_url_variables";

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
                    return `${this.context.case.snakeSafe(baseUrl.name)}_url`;
                }
                return DEFAULT_URL_METHOD;
            },
            _other: () => DEFAULT_URL_METHOD
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
        const urlVariablesImplBlock = this.createSingleUrlVariablesImplBlock(config);

        const module = rust.module({
            useStatements,
            rawDeclarations: [
                environmentEnum.toString(),
                implBlock.toString(),
                ...(urlVariablesImplBlock != null ? [urlVariablesImplBlock] : []),
                defaultImplBlock.toString()
            ]
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

        // Create URL structure for each environment
        const urlStructs = config.environments.map((env) => this.createUrlStruct(env, config.baseUrls));

        // Create the main environment enum
        const environmentEnum = this.createMultiUrlEnvironmentEnum(config.environments);

        // Create impl block for environment methods
        const implBlock = this.createMultiUrlImplBlock(config);

        // Create Default impl block
        const defaultImplBlock = this.createMultiUrlDefaultImplBlock(config);

        const urlVariablesImplBlock = this.createMultiUrlVariablesImplBlock(config);

        const module = rust.module({
            useStatements,
            rawDeclarations: [
                ...urlStructs.map((struct) => struct.toString()),
                environmentEnum.toString(),
                implBlock.toString(),
                ...(urlVariablesImplBlock != null ? [urlVariablesImplBlock] : []),
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
            name: `${this.context.case.pascalSafe(env.name)}Urls`,
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

    private createMultiUrlEnvironmentEnum(environments: FernIr.MultipleBaseUrlsEnvironment[]): Enum {
        const environmentEnumName = this.getEnvironmentEnumName();
        return rust.enum_({
            name: environmentEnumName,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize"])],
            variants: environments.map((env) =>
                rust.enumVariant({
                    name: this.context.case.pascalSafe(env.name),
                    data: [Type.reference(new Reference({ name: `${this.context.case.pascalSafe(env.name)}Urls` }))]
                })
            )
        });
    }

    private createMultiUrlImplBlock(config: FernIr.MultipleBaseUrlsEnvironments): ImplBlock {
        const getUrlMethod = this.createMultiUrlGetUrlMethod(config);
        const perUrlMethods = this.createPerBaseUrlGetterMethods(config);
        const environmentEnumName = this.getEnvironmentEnumName();

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            methods: [getUrlMethod, ...perUrlMethods]
        });
    }

    /**
     * Returns the server URL variables that are actually referenced by the given URL templates.
     * Filtering keeps the generated method free of unused parameters.
     */
    private getReferencedVariableOptions(templates: string[]): ServerVariableOption[] {
        return getServerVariableOptions(this.context.ir, this.context.case).filter((option) =>
            templates.some((template) => template.includes(`{${option.variable.id}}`))
        );
    }

    private createVariableBindings(options: ServerVariableOption[]): string {
        return options
            .map(
                (option) => `        let ${option.name} = ${option.name}.unwrap_or("${option.variable.default ?? ""}");`
            )
            .join("\n");
    }

    private createVariableParameters(options: ServerVariableOption[]): string {
        return options.map((option) => `, ${option.name}: Option<&str>`).join("");
    }

    /**
     * Generates `url_with_variables`, which resolves a single-URL environment's URL from its
     * template. Returns null when no environment declares a URL template.
     */
    private createSingleUrlVariablesImplBlock(config: FernIr.SingleBaseUrlEnvironments): string | null {
        const templates = config.environments
            .map((env) => env.urlTemplate)
            .filter((template): template is string => template != null);
        const options = this.getReferencedVariableOptions(templates);
        if (options.length === 0) {
            return null;
        }

        const matchArms = config.environments.map((env) => {
            const variant = `Self::${this.context.case.pascalSafe(env.name)}`;
            const expression =
                env.urlTemplate != null
                    ? urlTemplateToFormatExpression(env.urlTemplate, options)
                    : `"${env.url}".to_string()`;
            return `            ${variant} => ${expression},`;
        });

        return `impl ${this.getEnvironmentEnumName()} {
    /// Resolves this environment's URL, substituting the given server URL variables into its
    /// URL template. Variables that are not provided fall back to their defaults.
    pub fn ${URL_WITH_VARIABLES_METHOD}(&self${this.createVariableParameters(options)}) -> String {
${this.createVariableBindings(options)}
        match self {
${matchArms.join("\n")}
        }
    }
}`;
    }

    /**
     * Generates `with_url_variables`, which rebuilds a multi-URL environment's URLs from their
     * templates. Returns null when no environment declares URL templates.
     */
    private createMultiUrlVariablesImplBlock(config: FernIr.MultipleBaseUrlsEnvironments): string | null {
        const templates = config.environments.flatMap((env) => Object.values(env.urlTemplates ?? {}));
        const options = this.getReferencedVariableOptions(templates);
        if (options.length === 0) {
            return null;
        }

        const matchArms = config.environments.map((env) => {
            const variantName = this.context.case.pascalSafe(env.name);
            const fields = config.baseUrls.map((baseUrl) => {
                const fieldName = this.context.case.snakeSafe(baseUrl.name);
                const template = env.urlTemplates?.[baseUrl.id];
                const value =
                    template != null ? urlTemplateToFormatExpression(template, options) : `urls.${fieldName}.clone()`;
                return `                ${fieldName}: ${value},`;
            });
            const bindsUrls = config.baseUrls.some((baseUrl) => env.urlTemplates?.[baseUrl.id] == null);
            return `            Self::${variantName}(${bindsUrls ? "urls" : "_"}) => Self::${variantName}(${variantName}Urls {
${fields.join("\n")}
            }),`;
        });

        return `impl ${this.getEnvironmentEnumName()} {
    /// Returns this environment with the given server URL variables substituted into its URL
    /// templates. Variables that are not provided fall back to their defaults.
    pub fn ${WITH_URL_VARIABLES_METHOD}(&self${this.createVariableParameters(options)}) -> Self {
${this.createVariableBindings(options)}
        match self {
${matchArms.join("\n")}
        }
    }
}`;
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
                name: `${fieldName}_url`,
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

        // Create the URL struct instance with all base URLs
        const urlFields = config.baseUrls
            .map((baseUrl) => {
                const fieldName = this.context.case.snakeSafe(baseUrl.name);
                const url = defaultEnv.urls[baseUrl.id] || "";
                return `${fieldName}: "${url}".to_string()`;
            })
            .join(", ");

        const structName = `${this.context.case.pascalSafe(defaultEnv.name)}Urls`;
        const defaultExpr = `Self::${this.context.case.pascalSafe(defaultEnv.name)}(${structName} { ${urlFields} })`;

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
