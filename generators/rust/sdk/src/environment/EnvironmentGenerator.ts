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
                throw new Error("Unknown environments type: " + environmentsConfig.environments.type);
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
            new UseStatement({
                path: "crate::prelude",
                items: ["*"]
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
            throw new Error("No environments found for Default implementation");
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
            throw new Error("No environments found for Default implementation");
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
