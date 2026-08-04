import type { generatorsYml } from "@fern-api/configuration";
import { PublishTarget } from "@fern-api/ir-sdk";
import type { TaskContext } from "@fern-api/task-context";

/**
 * Computes the publish target stamped into `PublishingConfig.filesystem` for
 * local-file-system (download) output. The target carries the package identity
 * (name + version) that generators use to populate `package.json` / version
 * files and the `User-Agent` / `X-Fern-SDK-*` headers.
 *
 * Callers are responsible for substituting AUTO versions with the magic
 * placeholder before passing `version` / `userProvidedVersion`.
 */
export function getFilesystemPublishTarget({
    generatorInvocation,
    version,
    userProvidedVersion,
    packageName,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    userProvidedVersion: string | undefined;
    packageName: string | undefined;
    context: TaskContext;
}): PublishTarget | undefined {
    if (generatorInvocation.language === "python") {
        const publishTarget = PublishTarget.pypi({
            version,
            packageName
        });
        context.logger.debug(`Created PyPiPublishTarget: version ${version} package name: ${packageName}`);
        return publishTarget;
    } else if (generatorInvocation.language === "typescript") {
        // Only populate the npm publish target when the user explicitly passed
        // `--version`. We intentionally do NOT thread auto-computed versions or
        // package names on their own — doing so would cause unrelated behavior
        // changes (e.g. auto-bumping a version from the npm registry) for users
        // who rely on managing `package.json` themselves.
        if (userProvidedVersion != null) {
            const tsPackageName =
                packageName ??
                (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null
                    ? (generatorInvocation.raw.config as { packageJson?: { name?: string } }).packageJson?.name
                    : undefined);
            const publishTarget = PublishTarget.npm({
                version: userProvidedVersion,
                packageName: tsPackageName,
                tokenEnvironmentVariable: ""
            });
            context.logger.debug(
                `Created NpmPublishTarget: version ${userProvidedVersion} package name: ${tsPackageName}`
            );
            return publishTarget;
        }
        return undefined;
    } else if (generatorInvocation.language === "rust") {
        // Use Crates publish target for Rust (Cargo/crates.io)
        const publishTarget = PublishTarget.crates({
            version,
            packageName
        });
        context.logger.debug(`Created CratesPublishTarget: version ${version} package name: ${packageName}`);
        return publishTarget;
    } else if (generatorInvocation.language === "go") {
        // Only populate the go publish target when the user explicitly passed
        // `--version`. We intentionally do NOT thread auto-computed versions
        // here — Go SDKs do not ship a version file managed by the generator
        // (module versions are set via git tags), so the only reason to
        // populate this is when the user asked us to stamp the SDK with a
        // specific version (e.g. for the `X-Fern-SDK-Version` header).
        if (userProvidedVersion != null) {
            const goModulePath = (() => {
                const config = generatorInvocation.raw?.config;
                if (typeof config !== "object" || config === null) {
                    return undefined;
                }
                const module = (config as { module?: { path?: unknown } }).module;
                if (module == null || typeof module.path !== "string") {
                    return undefined;
                }
                return module.path;
            })();
            const publishTarget = PublishTarget.go({
                version: userProvidedVersion,
                modulePath: goModulePath
            });
            context.logger.debug(
                `Created GoPublishTarget: version ${userProvidedVersion} module path: ${goModulePath}`
            );
            return publishTarget;
        }
        return undefined;
    } else if (generatorInvocation.language === "java") {
        const config = generatorInvocation.raw?.config;

        interface JavaGeneratorConfig {
            group?: unknown;
            artifact?: unknown;
            "package-prefix"?: unknown;
            [key: string]: unknown;
        }

        // Support both styles: package-prefix/package_name and group/artifact
        const mavenCoordinate = (() => {
            if (!config || typeof config !== "object" || config === null) {
                return undefined;
            }

            const configObj = config as JavaGeneratorConfig;

            if (typeof configObj.group === "string" && typeof configObj.artifact === "string") {
                return {
                    groupId: configObj.group,
                    artifactId: configObj.artifact
                };
            } else if (typeof configObj["package-prefix"] === "string" && packageName) {
                return {
                    groupId: configObj["package-prefix"],
                    artifactId: packageName
                };
            } else if (typeof configObj["package-prefix"] === "string" && !packageName) {
                context.logger.warn("Java generator has package-prefix configured but packageName is missing");
            }

            return undefined;
        })();

        const coordinate = mavenCoordinate ? `${mavenCoordinate.groupId}:${mavenCoordinate.artifactId}` : undefined;

        if (coordinate) {
            const mavenVersion = version ?? "0.0.0";
            const publishTarget = PublishTarget.maven({
                coordinate,
                version: mavenVersion,
                usernameEnvironmentVariable: "MAVEN_USERNAME",
                passwordEnvironmentVariable: "MAVEN_PASSWORD",
                mavenUrlEnvironmentVariable: "MAVEN_PUBLISH_REGISTRY_URL"
            });
            context.logger.debug(`Created MavenPublishTarget: coordinate ${coordinate} version ${mavenVersion}`);
            return publishTarget;
        } else if (config && typeof config === "object") {
            context.logger.debug(
                "Java generator config provided but could not construct Maven coordinate. " +
                    "Expected either 'group' and 'artifact' or 'package-prefix' with packageName."
            );
        }
        return undefined;
    } else if (generatorInvocation.language === "ruby") {
        const publishTarget = PublishTarget.rubygems({
            version,
            packageName
        });
        context.logger.debug(`Created RubyGemsPublishTarget: version ${version} package name: ${packageName}`);
        return publishTarget;
    } else if (generatorInvocation.language === "php") {
        const phpPackageName =
            packageName ??
            (() => {
                const config = generatorInvocation.raw?.config;
                if (typeof config !== "object" || config === null) {
                    return undefined;
                }
                const configPackageName = (config as { packageName?: unknown }).packageName;
                return typeof configPackageName === "string" ? configPackageName : undefined;
            })();
        const publishTarget = PublishTarget.packagist({
            version,
            packageName: phpPackageName
        });
        context.logger.debug(`Created PackagistPublishTarget: version ${version} package name: ${phpPackageName}`);
        return publishTarget;
    } else if (generatorInvocation.language === "csharp") {
        // Only populate the nuget publish target when the user explicitly
        // passed `--version`. C# SDKs generate a `Version.cs` constant from
        // this value; without an explicit version there is nothing to stamp.
        if (userProvidedVersion != null) {
            const csharpPackageName =
                packageName ??
                (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null
                    ? (generatorInvocation.raw.config as { ["package-id"]?: unknown })["package-id"]
                    : undefined);
            const publishTarget = PublishTarget.nuget({
                version: userProvidedVersion,
                packageName: typeof csharpPackageName === "string" ? csharpPackageName : undefined
            });
            context.logger.debug(
                `Created NugetPublishTarget: version ${userProvidedVersion} package name: ${String(csharpPackageName)}`
            );
            return publishTarget;
        }
        return undefined;
    }
    return undefined;
}
