import { generatorsYml } from "@fern-api/configuration";
import { getPackageNameFromGeneratorConfig } from "./checkVersionExists.js";

/**
 * Resolves the package name used to key SDK snippets / dynamic IRs for a generator.
 *
 * `generatorsYml.getPackageName()` only knows about registry publish targets
 * (`github.publishInfo`), so it is `undefined` for github-output-only SDKs,
 * `publish` / `publishV2` output modes, and languages without a registry in the
 * publishInfo union (php, swift). This falls back to the raw generator config
 * (`output.package-name`, `config.package_name`, `config.packageName`,
 * `config.module.path`, ...) so every snippet code path agrees on the name.
 */
export function resolveSnippetPackageName(generatorInvocation: generatorsYml.GeneratorInvocation): string | undefined {
    return (
        generatorsYml.getPackageName({ generatorInvocation }) ?? getPackageNameFromGeneratorConfig(generatorInvocation)
    );
}
