import type { schemas } from "@fern-api/config";
import type { generatorsYml } from "@fern-api/configuration";
import type { MigratorWarning } from "../types/index.js";
import { convertGitOutput } from "./convertGitOutput.js";

/**
 * Raw output configuration that supports both old (location discriminant)
 * and new (direct git field) formats.
 */
export interface RawOutputConfig {
    location?: string;
    path?: string;
    git?: RawGitConfig;
    "package-name"?: string;
    [key: string]: unknown;
}

/**
 * Raw git configuration for output.git field.
 */
export interface RawGitConfig {
    repository?: string;
    mode?: string;
    branch?: string;
    license?: string | { custom: string };
}

/**
 * Raw GitHub configuration that extends the base schema with looser typing.
 */
export interface RawGithubConfig {
    repository?: string;
    mode?: string;
    branch?: string;
    license?: string | { custom: string };
    reviewers?: unknown;
}

/**
 * Raw generator invocation that uses RawOutputConfig instead of the strict schema.
 */
export interface RawGeneratorInvocation
    extends Omit<Partial<generatorsYml.BaseGeneratorInvocationSchema>, "output" | "github"> {
    name?: string;
    image?: generatorsYml.GeneratorImageObjectSchema;
    output?: RawOutputConfig;
    github?: RawGithubConfig;
}

/**
 * Raw generator group that uses RawGeneratorInvocation.
 */
export interface RawGeneratorGroup extends Omit<generatorsYml.GeneratorGroupSchema, "generators"> {
    generators?: RawGeneratorInvocation[];
}

/**
 * Raw readme config that supports both camelCase and kebab-case field names.
 */
export interface RawReadmeConfig extends Partial<generatorsYml.ReadmeSchema> {
    "default-endpoint"?: generatorsYml.ReadmeEndpointSchema;
}

/**
 * Mapping of Docker image names to their languages.
 */
const DOCKER_IMAGE_TO_LANGUAGE: Record<string, schemas.SdkTargetLanguageSchema> = {
    // Client SDKs
    "fernapi/fern-csharp-sdk": "csharp",
    "fernapi/fern-go-sdk": "go",
    "fernapi/fern-java-sdk": "java",
    "fernapi/fern-php-sdk": "php",
    "fernapi/fern-python-sdk": "python",
    "fernapi/fern-ruby-sdk": "ruby",
    "fernapi/fern-rust-sdk": "rust",
    "fernapi/fern-swift-sdk": "swift",
    "fernapi/fern-typescript-sdk": "typescript",

    // Server stubs
    "fernapi/fern-typescript-express": "typescript",
    "fernapi/fern-fastapi-server": "python",
    "fernapi/fern-java-spring": "java",

    // Legacy/alternative names
    "fernapi/fern-typescript-node-sdk": "typescript",
    "fernapi/fern-typescript-browser-sdk": "typescript"
};

export interface ConvertSdkTargetsResult {
    sdks: schemas.SdksSchema;
    warnings: MigratorWarning[];
}

export interface ConvertSdkTargetsOptions {
    groups: Record<string, generatorsYml.GeneratorGroupSchema> | undefined;
    defaultGroup: string | undefined;
    autorelease: boolean | undefined;
    readme: generatorsYml.ReadmeSchema | undefined;
    apiName?: string;
}

/**
 * Converts legacy generator groups to new fern.yml sdks format.
 */
export function convertSdkTargets(options: ConvertSdkTargetsOptions): ConvertSdkTargetsResult {
    const { groups, defaultGroup, autorelease, readme, apiName } = options;
    const warnings: MigratorWarning[] = [];

    const targets: Record<string, schemas.SdkTargetSchema> = {};
    const languageCounts: Record<string, number> = {};

    if (groups == null) {
        return {
            sdks: { targets: {} },
            warnings
        };
    }

    for (const [groupName, group] of Object.entries(groups)) {
        for (const generator of group.generators) {
            const targetResult = convertGeneratorToTarget({
                generator,
                groupName,
                languageCounts,
                apiName,
                warnings
            });

            if (targetResult != null) {
                targets[targetResult.name] = targetResult.target;
            }
        }
    }

    const sdks: schemas.SdksSchema = { targets };

    if (autorelease != null) {
        sdks.autorelease = autorelease;
    }

    if (readme != null) {
        const convertedReadme = convertReadme(readme);
        if (convertedReadme != null) {
            sdks.readme = convertedReadme;
        }
    }

    return { sdks, warnings };
}

interface ConvertGeneratorOptions {
    generator: generatorsYml.GeneratorInvocationSchema;
    groupName: string;
    languageCounts: Record<string, number>;
    apiName: string | undefined;
    warnings: MigratorWarning[];
}

interface ConvertGeneratorResult {
    name: string;
    target: schemas.SdkTargetSchema;
}

function convertGeneratorToTarget(options: ConvertGeneratorOptions): ConvertGeneratorResult | undefined {
    const { generator, groupName, languageCounts, apiName, warnings } = options;

    const generatorName = "image" in generator ? generator.image.name : generator.name;
    const language = getLanguageFromGeneratorName(generatorName);
    if (language == null) {
        warnings.push({
            type: "unsupported",
            message: `Unknown generator: ${generatorName}`,
            suggestion: "Manually add this generator to your fern.yml"
        });
        return undefined;
    }

    const baseName = apiName != null ? `${language}-${apiName}` : language;

    const count = (languageCounts[baseName] ?? 0) + 1;
    languageCounts[baseName] = count;

    const targetName = count === 1 ? baseName : `${baseName}-${count}`;
    const target: schemas.SdkTargetSchema = {
        output: {}
    };

    // If the generator uses a custom image with registry, set the image field
    if ("image" in generator) {
        target.image = {
            name: generator.image.name,
            registry: generator.image.registry
        };
    }

    target.lang = language;
    if (apiName != null) {
        target.api = apiName;
    }
    if (generator.version != null) {
        target.version = generator.version;
    }
    if (generator.config != null) {
        target.config = generator.config as Record<string, unknown>;
    }

    // Convert output configuration
    const outputResult = convertOutputConfig(generator, warnings);
    target.output = outputResult.output;
    if (outputResult.publish != null) {
        target.publish = outputResult.publish;
    }

    // Migrate generator-level metadata.
    if (generator.metadata != null) {
        const meta = generator.metadata;
        const targetMetadata: schemas.MetadataSchema = {};
        if (meta["package-description"] != null) {
            targetMetadata.description = meta["package-description"];
        }
        if (meta.author != null || meta.email != null) {
            targetMetadata.authors = [{ name: meta.author ?? "", email: meta.email ?? "" }];
        }
        if (meta["reference-url"] != null) {
            warnings.push({
                type: "unsupported",
                message: `metadata.reference-url is not supported in fern.yml`,
                suggestion: "Remove reference-url from metadata"
            });
        }
        if (meta.license != null && typeof target.output !== "string" && target.output.git != null) {
            const license = meta.license;
            target.output.git.license = typeof license === "string" ? license : (license as { custom: string }).custom;
        }
        if (targetMetadata.description != null || targetMetadata.authors != null) {
            target.metadata = targetMetadata;
        }
    }

    if ((generator as { "smart-casing"?: boolean })["smart-casing"] != null) {
        warnings.push({
            type: "unsupported",
            message: `smart-casing is not supported in fern.yml`,
            suggestion: "Remove smart-casing from your generator configuration"
        });
    }

    if (generator["ir-version"] != null) {
        warnings.push({
            type: "deprecated",
            message: `ir-version override (${generator["ir-version"]}) is not supported in fern.yml`,
            suggestion: "Remove ir-version and update your generator version instead"
        });
    }
    if (generator.snippets != null) {
        warnings.push({
            type: "unsupported",
            message: "Snippets configuration is not yet supported in fern.yml"
        });
    }
    if (generator.keywords != null) {
        warnings.push({
            type: "unsupported",
            message: "Keywords configuration is not supported in fern.yml"
        });
    }

    return { name: targetName, target };
}

function getLanguageFromGeneratorName(name: string): schemas.SdkTargetLanguageSchema | undefined {
    if (DOCKER_IMAGE_TO_LANGUAGE[name] != null) {
        return DOCKER_IMAGE_TO_LANGUAGE[name];
    }

    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("typescript") || lowercaseName.includes("ts-")) {
        return "typescript";
    }
    if (lowercaseName.includes("python")) {
        return "python";
    }
    if (lowercaseName.includes("java") && !lowercaseName.includes("javascript")) {
        return "java";
    }
    if (lowercaseName.includes("go-") || lowercaseName.endsWith("-go")) {
        return "go";
    }
    if (lowercaseName.includes("ruby")) {
        return "ruby";
    }
    if (lowercaseName.includes("csharp") || lowercaseName.includes("c#") || lowercaseName.includes("dotnet")) {
        return "csharp";
    }
    if (lowercaseName.includes("swift")) {
        return "swift";
    }
    if (lowercaseName.includes("php")) {
        return "php";
    }
    if (lowercaseName.includes("rust")) {
        return "rust";
    }

    return undefined;
}

interface ConvertOutputConfigResult {
    output: schemas.OutputSchema;
    publish?: schemas.PublishSchema;
}

function convertOutputConfig(
    generator: generatorsYml.GeneratorInvocationSchema,
    warnings: MigratorWarning[]
): ConvertOutputConfigResult {
    const output: schemas.OutputSchema = {};
    let publish: schemas.PublishSchema | undefined;

    if (generator.github != null) {
        const gitResult = convertGitOutput(generator.github);
        warnings.push(...gitResult.warnings);
        if (gitResult.gitOutput != null) {
            output.git = gitResult.gitOutput;
        }
    }
    if (generator.output != null) {
        const outputLocation = generator.output;
        switch (outputLocation.location) {
            case "local-file-system": {
                const localOutput = outputLocation as generatorsYml.GeneratorOutputSchema.LocalFileSystem;
                output.path = localOutput.path;
                break;
            }
            case "npm": {
                const npmOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Npm;
                publish = {
                    npm: {
                        packageName: npmOutput["package-name"],
                        url: npmOutput.url,
                        token: npmOutput.token
                    }
                };
                break;
            }
            case "pypi": {
                const pypiOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Pypi;
                publish = {
                    pypi: {
                        packageName: pypiOutput["package-name"],
                        url: pypiOutput.url,
                        token: pypiOutput.token,
                        username: pypiOutput.username,
                        password: pypiOutput.password,
                        metadata:
                            pypiOutput.metadata != null
                                ? {
                                      keywords: pypiOutput.metadata.keywords,
                                      documentationLink: pypiOutput.metadata["documentation-link"],
                                      homepageLink: pypiOutput.metadata["homepage-link"]
                                  }
                                : undefined
                    }
                };
                break;
            }
            case "maven": {
                const mavenOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Maven;
                publish = {
                    maven: {
                        coordinate: mavenOutput.coordinate,
                        url: mavenOutput.url,
                        username: mavenOutput.username,
                        password: mavenOutput.password,
                        signature:
                            mavenOutput.signature != null
                                ? {
                                      keyId: mavenOutput.signature.keyId,
                                      password: mavenOutput.signature.password,
                                      secretKey: mavenOutput.signature.secretKey
                                  }
                                : undefined
                    }
                };
                break;
            }
            case "nuget": {
                const nugetOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Nuget;
                publish = {
                    nuget: {
                        packageName: nugetOutput["package-name"],
                        url: nugetOutput.url,
                        apiKey: nugetOutput["api-key"]
                    }
                };
                break;
            }
            case "rubygems": {
                const rubygemsOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Rubygems;
                publish = {
                    rubygems: {
                        packageName: rubygemsOutput["package-name"],
                        url: rubygemsOutput.url,
                        apiKey: rubygemsOutput["api-key"]
                    }
                };
                break;
            }
            case "crates": {
                const cratesOutput = outputLocation as generatorsYml.GeneratorOutputSchema.Crates;
                publish = {
                    crates: {
                        packageName: cratesOutput["package-name"],
                        url: cratesOutput.url,
                        token: cratesOutput.token
                    }
                };
                break;
            }
            case "postman": {
                warnings.push({
                    type: "unsupported",
                    message: "Postman output is not supported in fern.yml SDK targets",
                    suggestion: "Use a separate Postman generator configuration"
                });
                break;
            }
            default: {
                warnings.push({
                    type: "unsupported",
                    message: `Unknown output location: ${(outputLocation as { location: string }).location}`
                });
            }
        }
    }

    return { output, publish };
}

function convertReadmeEndpoint(endpoint: generatorsYml.ReadmeEndpointSchema): schemas.ReadmeEndpointSchema {
    if (typeof endpoint === "string") {
        return endpoint;
    }
    return {
        method: endpoint.method,
        path: endpoint.path,
        ...(endpoint.stream != null ? { stream: endpoint.stream } : {})
    };
}

function convertReadme(readme: generatorsYml.ReadmeSchema): schemas.ReadmeSchema | undefined {
    const result: schemas.ReadmeSchema = {};
    let hasFields = false;

    if (readme.bannerLink != null) {
        result.bannerLink = readme.bannerLink;
        hasFields = true;
    }
    if (readme.introduction != null) {
        result.introduction = readme.introduction;
        hasFields = true;
    }
    if (readme.apiReferenceLink != null) {
        result.apiReferenceLink = readme.apiReferenceLink;
        hasFields = true;
    }
    if (readme.apiName != null) {
        result.apiName = readme.apiName;
        hasFields = true;
    }
    if (readme.disabledSections != null) {
        result.disabledSections = readme.disabledSections;
        hasFields = true;
    }
    if (readme.defaultEndpoint != null) {
        result.defaultEndpoint = convertReadmeEndpoint(readme.defaultEndpoint);
        hasFields = true;
    }
    if (readme.features != null) {
        const features: Record<string, schemas.ReadmeEndpointSchema[]> = {};
        for (const [key, endpoints] of Object.entries(readme.features)) {
            features[key] = endpoints.map(convertReadmeEndpoint);
        }
        result.features = features;
        hasFields = true;
    }
    if (readme.customSections != null) {
        result.customSections = readme.customSections.map((section) => ({
            title: section.title,
            language: section.language as schemas.SdkTargetLanguageSchema | undefined,
            content: section.content
        }));
        hasFields = true;
    }
    if (readme.exampleStyle != null) {
        result.exampleStyle = readme.exampleStyle as schemas.ExampleStyleSchema;
        hasFields = true;
    }

    return hasFields ? result : undefined;
}

export interface ConvertSdkTargetsFromRawOptions {
    /** Generator groups - accepts both standard schema and raw types for format variations */
    groups: Record<string, generatorsYml.GeneratorGroupSchema | RawGeneratorGroup> | undefined;
    defaultGroup: string | undefined;
    autorelease: boolean | undefined;
    /** Readme config - accepts both standard schema and raw types for kebab-case support */
    readme: generatorsYml.ReadmeSchema | RawReadmeConfig | undefined;
    apiName?: string;
}

/**
 * Converts raw generator groups (from YAML) to new fern.yml sdks format.
 * This handles both old and new generators.yml formats.
 */
export function convertSdkTargetsFromRaw(options: ConvertSdkTargetsFromRawOptions): ConvertSdkTargetsResult {
    const { groups, defaultGroup, autorelease, readme, apiName } = options;
    const warnings: MigratorWarning[] = [];

    const targets: Record<string, schemas.SdkTargetSchema> = {};
    const languageCounts: Record<string, number> = {};

    if (groups == null) {
        return {
            sdks: { targets: {} },
            warnings
        };
    }

    for (const [groupName, group] of Object.entries(groups)) {
        if (group.generators == null) {
            continue;
        }
        for (const generator of group.generators) {
            const targetResult = convertRawGeneratorToTarget({
                generator: generator as RawGeneratorInvocation,
                groupName,
                languageCounts,
                apiName,
                warnings
            });
            if (targetResult != null) {
                targets[targetResult.name] = targetResult.target;
            }
        }
    }

    const sdks: schemas.SdksSchema = { targets };
    if (autorelease != null) {
        sdks.autorelease = autorelease;
    }
    if (readme != null) {
        const convertedReadme = convertRawReadme(readme);
        if (convertedReadme != null) {
            sdks.readme = convertedReadme;
        }
    }

    return { sdks, warnings };
}

interface ConvertRawGeneratorOptions {
    generator: RawGeneratorInvocation;
    groupName: string;
    languageCounts: Record<string, number>;
    apiName: string | undefined;
    warnings: MigratorWarning[];
}

function convertRawGeneratorToTarget(options: ConvertRawGeneratorOptions): ConvertGeneratorResult | undefined {
    const { generator, groupName, languageCounts, apiName, warnings } = options;

    const generatorName = generator.name ?? generator.image?.name;
    if (generatorName == null) {
        warnings.push({
            type: "conflict",
            message: "Generator missing 'name' or 'image.name' field"
        });
        return undefined;
    }

    // Determine language from generator name (Docker image)
    const language = getLanguageFromGeneratorName(generatorName);

    if (language == null) {
        warnings.push({
            type: "unsupported",
            message: `Unknown generator: ${generatorName}`,
            suggestion: "Manually add this generator to your fern.yml"
        });
        return undefined;
    }

    const baseName = apiName != null ? `${language}-${apiName}` : language;

    const count = (languageCounts[baseName] ?? 0) + 1;
    languageCounts[baseName] = count;

    const targetName = count === 1 ? baseName : `${baseName}-${count}`;

    const target: schemas.SdkTargetSchema = {
        output: {}
    };

    // If the generator uses a custom image with registry, set the image field
    if (generator.image != null) {
        target.image = {
            name: generator.image.name,
            registry: generator.image.registry
        };
    }

    target.lang = language;
    if (apiName != null) {
        target.api = apiName;
    }
    if (generator.version != null) {
        target.version = generator.version;
    }
    if (generator.config != null) {
        target.config = generator.config as Record<string, unknown>;
    }

    const outputResult = convertRawOutputConfig(generator, warnings);
    target.output = outputResult.output;
    if (outputResult.publish != null) {
        target.publish = outputResult.publish;
    }

    // Migrate generator-level metadata to the new target metadata schema.
    const generatorMetadata = generator.metadata as
        | {
              license?: string | { custom: string };
              author?: string;
              email?: string;
              "package-description"?: string;
              "reference-url"?: string;
          }
        | undefined;
    if (generatorMetadata != null) {
        const targetMetadata: schemas.MetadataSchema = {};
        if (generatorMetadata["package-description"] != null) {
            targetMetadata.description = generatorMetadata["package-description"];
        }
        if (generatorMetadata.author != null || generatorMetadata.email != null) {
            targetMetadata.authors = [{ name: generatorMetadata.author ?? "", email: generatorMetadata.email ?? "" }];
        }
        if (generatorMetadata["reference-url"] != null) {
            warnings.push({
                type: "unsupported",
                message: `metadata.reference-url is not supported in fern.yml`,
                suggestion: "Remove reference-url from metadata"
            });
        }
        // Migrate license to output.git.license if a git output is configured.
        if (generatorMetadata.license != null && typeof target.output !== "string" && target.output.git != null) {
            const license = generatorMetadata.license;
            target.output.git.license = typeof license === "string" ? license : (license as { custom: string }).custom;
        }
        if (targetMetadata.description != null || targetMetadata.authors != null) {
            target.metadata = targetMetadata;
        }
    }

    if ((generator as { "smart-casing"?: boolean })["smart-casing"] != null) {
        warnings.push({
            type: "unsupported",
            message: `smart-casing is not supported in fern.yml`,
            suggestion: "Remove smart-casing from your generator configuration"
        });
    }

    if (generator["ir-version"] != null) {
        warnings.push({
            type: "deprecated",
            message: `ir-version override (${generator["ir-version"]}) is not supported in fern.yml`,
            suggestion: "Remove ir-version and update your generator version instead"
        });
    }
    if (generator.snippets != null) {
        warnings.push({
            type: "unsupported",
            message: "Snippets configuration is not yet supported in fern.yml"
        });
    }
    if (generator.keywords != null) {
        warnings.push({
            type: "unsupported",
            message: "Keywords configuration is not supported in fern.yml"
        });
    }

    return { name: targetName, target };
}

function convertRawOutputConfig(
    generator: RawGeneratorInvocation,
    warnings: MigratorWarning[]
): ConvertOutputConfigResult {
    const output: schemas.OutputSchema = {};
    let publish: schemas.PublishSchema | undefined;

    if (generator.output?.git != null) {
        const gitConfig = generator.output.git;
        if (gitConfig.repository != null) {
            output.git = {
                repository: gitConfig.repository
            };

            if (gitConfig.mode != null) {
                if (gitConfig.mode === "pull-request") {
                    output.git.mode = "pr";
                } else if (gitConfig.mode === "push") {
                    output.git.mode = "push";
                } else if (gitConfig.mode === "release" || gitConfig.mode === "commit") {
                    output.git.mode = "release";
                }
            }

            if (gitConfig.branch != null) {
                output.git.branch = gitConfig.branch;
            }

            if (gitConfig.license != null) {
                if (typeof gitConfig.license === "string") {
                    output.git.license = gitConfig.license;
                } else if (typeof gitConfig.license === "object" && "custom" in gitConfig.license) {
                    output.git.license = gitConfig.license.custom;
                }
            }
        }
    }

    if (generator.github != null && output.git == null) {
        const githubConfig = generator.github;
        if (githubConfig.repository != null) {
            output.git = {
                repository: githubConfig.repository
            };

            if (githubConfig.mode != null) {
                if (githubConfig.mode === "pull-request") {
                    output.git.mode = "pr";
                } else if (githubConfig.mode === "push") {
                    output.git.mode = "push";
                } else if (githubConfig.mode === "release" || githubConfig.mode === "commit") {
                    output.git.mode = "release";
                }
            }

            if (githubConfig.branch != null) {
                output.git.branch = githubConfig.branch;
            }

            if (githubConfig.license != null) {
                if (typeof githubConfig.license === "string") {
                    output.git.license = githubConfig.license;
                } else if (typeof githubConfig.license === "object" && "custom" in githubConfig.license) {
                    output.git.license = githubConfig.license.custom;
                }
            }

            if (githubConfig.reviewers != null) {
                const reviewers = githubConfig.reviewers as { teams?: string[]; users?: string[] };
                if (reviewers.teams != null || reviewers.users != null) {
                    output.git.reviewers = {
                        teams: reviewers.teams,
                        users: reviewers.users
                    };
                }
            }
        }
    }

    if (generator.output?.location != null) {
        const location = generator.output.location;
        const rawOutput = generator.output;

        switch (location) {
            case "local-file-system": {
                if (rawOutput.path != null) {
                    output.path = rawOutput.path as string;
                }
                break;
            }

            case "npm": {
                const packageName = rawOutput["package-name"];
                if (typeof packageName === "string") {
                    publish = {
                        npm: {
                            packageName,
                            url: rawOutput["url"] as string | undefined,
                            token: rawOutput["token"] as string | undefined
                        }
                    };
                }
                break;
            }

            case "pypi": {
                const packageName = rawOutput["package-name"];
                if (typeof packageName === "string") {
                    const metadata = rawOutput["metadata"] as
                        | {
                              keywords?: string[];
                              documentationLink?: string;
                              homepageLink?: string;
                          }
                        | undefined;
                    publish = {
                        pypi: {
                            packageName,
                            url: rawOutput["url"] as string | undefined,
                            token: rawOutput["token"] as string | undefined,
                            username: rawOutput["username"] as string | undefined,
                            password: rawOutput["password"] as string | undefined,
                            metadata:
                                metadata != null
                                    ? {
                                          keywords: metadata.keywords,
                                          documentationLink: metadata.documentationLink,
                                          homepageLink: metadata.homepageLink
                                      }
                                    : undefined
                        }
                    };
                }
                break;
            }

            case "maven": {
                const coordinate = rawOutput["coordinate"];
                if (typeof coordinate === "string") {
                    const signature = rawOutput["signature"] as
                        | {
                              keyId: string;
                              password: string;
                              secretKey: string;
                          }
                        | undefined;
                    publish = {
                        maven: {
                            coordinate,
                            url: rawOutput["url"] as string | undefined,
                            username: rawOutput["username"] as string | undefined,
                            password: rawOutput["password"] as string | undefined,
                            signature:
                                signature != null
                                    ? {
                                          keyId: signature.keyId,
                                          password: signature.password,
                                          secretKey: signature.secretKey
                                      }
                                    : undefined
                        }
                    };
                }
                break;
            }

            case "nuget": {
                const packageName = rawOutput["package-name"];
                if (typeof packageName === "string") {
                    publish = {
                        nuget: {
                            packageName,
                            url: rawOutput["url"] as string | undefined,
                            apiKey: rawOutput["api-key"] as string | undefined
                        }
                    };
                }
                break;
            }

            case "rubygems": {
                const packageName = rawOutput["package-name"];
                if (typeof packageName === "string") {
                    publish = {
                        rubygems: {
                            packageName,
                            url: rawOutput["url"] as string | undefined,
                            apiKey: rawOutput["api-key"] as string | undefined
                        }
                    };
                }
                break;
            }

            case "crates": {
                const packageName = rawOutput["package-name"];
                if (typeof packageName === "string") {
                    publish = {
                        crates: {
                            packageName,
                            url: rawOutput["url"] as string | undefined,
                            token: rawOutput["token"] as string | undefined
                        }
                    };
                }
                break;
            }

            case "postman": {
                warnings.push({
                    type: "unsupported",
                    message: "Postman output is not supported in fern.yml SDK targets",
                    suggestion: "Use a separate Postman generator configuration"
                });
                break;
            }

            default: {
                warnings.push({
                    type: "unsupported",
                    message: `Unknown output location: ${location}`
                });
            }
        }
    }

    return { output, publish };
}

function convertRawReadme(readme: RawReadmeConfig): schemas.ReadmeSchema | undefined {
    const endpoint = readme.defaultEndpoint ?? readme["default-endpoint"];

    const result: schemas.ReadmeSchema = {};
    let hasFields = false;

    if (readme.bannerLink != null) {
        result.bannerLink = readme.bannerLink;
        hasFields = true;
    }
    if (readme.introduction != null) {
        result.introduction = readme.introduction;
        hasFields = true;
    }
    if (readme.apiReferenceLink != null) {
        result.apiReferenceLink = readme.apiReferenceLink;
        hasFields = true;
    }
    if (readme.apiName != null) {
        result.apiName = readme.apiName;
        hasFields = true;
    }
    if (readme.disabledSections != null) {
        result.disabledSections = readme.disabledSections;
        hasFields = true;
    }
    if (endpoint != null) {
        result.defaultEndpoint = convertReadmeEndpoint(endpoint);
        hasFields = true;
    }
    if (readme.features != null) {
        const features: Record<string, schemas.ReadmeEndpointSchema[]> = {};
        for (const [key, endpoints] of Object.entries(readme.features)) {
            features[key] = endpoints.map(convertReadmeEndpoint);
        }
        result.features = features;
        hasFields = true;
    }
    if (readme.customSections != null) {
        result.customSections = readme.customSections.map((section) => ({
            title: section.title,
            language: section.language as schemas.SdkTargetLanguageSchema | undefined,
            content: section.content
        }));
        hasFields = true;
    }
    if (readme.exampleStyle != null) {
        result.exampleStyle = readme.exampleStyle as schemas.ExampleStyleSchema;
        hasFields = true;
    }

    return hasFields ? result : undefined;
}
