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
import {
    EnvironmentBaseUrlWithId,
    MultipleBaseUrlsEnvironment,
    MultipleBaseUrlsEnvironments,
    SingleBaseUrlEnvironment,
    SingleBaseUrlEnvironments
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

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

    private generateSingleUrlEnvironment(config: SingleBaseUrlEnvironments): RustFile {
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

    private generateMultiUrlEnvironment(config: MultipleBaseUrlsEnvironments): RustFile {
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

        const module = rust.module({
            useStatements,
            rawDeclarations: [
                ...urlStructs.map((struct) => struct.toString()),
                environmentEnum.toString(),
                implBlock.toString()
            ]
        });

        return new RustFile({
            filename: "environment.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: module.toString()
        });
    }

    private createEnvironmentEnum(environments: SingleBaseUrlEnvironment[]): Enum {
        const environmentEnumName = this.getEnvironmentEnumName();
        return rust.enum_({
            name: environmentEnumName,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Copy", "PartialEq", "Eq", "Serialize", "Deserialize"])],
            variants: environments.map((env) => this.createEnumVariant(env))
        });
    }

    private createEnumVariant(env: SingleBaseUrlEnvironment): EnumVariant {
        const needsRename = env.name.pascalCase.safeName !== env.name.camelCase.safeName;

        return rust.enumVariant({
            name: env.name.pascalCase.safeName,
            attributes: needsRename ? [Attribute.serde.rename(env.name.camelCase.safeName)] : []
        });
    }

    private createEnvironmentImplBlock(environments: SingleBaseUrlEnvironment[]): ImplBlock {
        const urlMethod = this.createUrlMethod(environments);
        const environmentEnumName = this.getEnvironmentEnumName();

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            methods: [urlMethod]
        });
    }

    private createUrlMethod(environments: SingleBaseUrlEnvironment[]): Method {
        // Create match arms for each environment using proper AST
        const matchArms = environments.map((env) => {
            const pattern = Pattern.variable(`Self::${env.name.pascalCase.safeName}`);
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

    private createDefaultImplBlock(environments: SingleBaseUrlEnvironment[]): ImplBlock {
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
            body: CodeBlock.fromExpression(Expression.reference(`Self::${defaultEnv.name.pascalCase.safeName}`))
        });

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private createUrlStruct(env: MultipleBaseUrlsEnvironment, baseUrls: EnvironmentBaseUrlWithId[]): Struct {
        return rust.struct({
            name: `${env.name.pascalCase.safeName}Urls`,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize"])],
            fields: baseUrls.map((baseUrl) =>
                rust.field({
                    name: baseUrl.name.snakeCase.safeName,
                    type: Type.string(),
                    visibility: PUBLIC
                })
            )
        });
    }

    private createMultiUrlEnvironmentEnum(environments: MultipleBaseUrlsEnvironment[]): Enum {
        const environmentEnumName = this.getEnvironmentEnumName();
        return rust.enum_({
            name: environmentEnumName,
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize"])],
            variants: environments.map((env) =>
                rust.enumVariant({
                    name: env.name.pascalCase.safeName,
                    data: [Type.reference(new Reference({ name: `${env.name.pascalCase.safeName}Urls` }))]
                })
            )
        });
    }

    private createMultiUrlImplBlock(config: MultipleBaseUrlsEnvironments): ImplBlock {
        const getUrlMethod = this.createMultiUrlGetUrlMethod(config);
        const environmentEnumName = this.getEnvironmentEnumName();

        return rust.implBlock({
            targetType: Type.reference(new Reference({ name: environmentEnumName })),
            methods: [getUrlMethod]
        });
    }

    private createMultiUrlGetUrlMethod(config: MultipleBaseUrlsEnvironments): Method {
        const matchArms = config.environments.map((env) => {
            // Use tuple pattern for tuple enum variants
            const pattern = Pattern.raw(`Self::${env.name.pascalCase.safeName}(urls)`);
            const fieldName = config.baseUrls[0]?.name.snakeCase.safeName || "default";
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

    private getEnvironmentEnumName(): string {
        const customConfig = this.context.customConfig;
        return customConfig.environmentEnumName || "Environment";
    }
}
