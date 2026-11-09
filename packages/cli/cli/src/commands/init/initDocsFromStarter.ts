import { errorMessageOrString } from "@fern-api/core-utils";
import { initializeDocs } from "@fern-api/init";
import { defaultDocsSiteChoices, getDocsStarter, layoutFromFlag, scaffoldDocsSite } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";
import { getLatestVersionOfCli } from "../../cli-context/upgrade-utils/getLatestVersionOfCli.js";
import { isSdkConfigInitEnabled } from "../../utils/isSdkConfigInitEnabled.js";

/**
 * `fern init --docs --template <layout>`: a docs site from Fern's docs starter (the Fern Dashboard's
 * onboarding template), downloaded on first use. Like the setup wizard, falls back to Fern's basic
 * docs site when the starter can't be downloaded.
 */
export async function initDocsFromStarter({
    cliContext,
    organization,
    template
}: {
    cliContext: CliContext;
    organization: string;
    template: string;
}): Promise<void> {
    const layout = layoutFromFlag(template);
    if (layout === undefined) {
        return cliContext.failAndThrow(
            `Unknown docs template "${template}". Choose stacked, side-by-side, or minimal.`
        );
    }
    // Like every other `fern init`, pin the newest release.
    const versionOfCli = await getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
    cliContext.logger.info("Downloading Fern's docs starter...");
    let templateDir: string;
    try {
        templateDir = await getDocsStarter();
    } catch (error) {
        cliContext.logger.warn(
            `Couldn't download the docs starter (${errorMessageOrString(error)}), so using Fern's basic docs site.`
        );
        await cliContext.runTask((taskContext) =>
            initializeDocs({
                organization,
                versionOfCli,
                taskContext,
                openApi: undefined,
                useSdkConfig: isSdkConfigInitEnabled()
            })
        );
        return;
    }
    const result = await scaffoldDocsSite({
        dir: process.cwd(),
        org: organization,
        choices: defaultDocsSiteChoices(organization, layout),
        templateDir,
        fernVersion: versionOfCli
    });
    cliContext.logger.info(`Created your docs site in fern/ (${result.written.length} files).`);
    if (result.skipped.length > 0) {
        cliContext.logger.info(`Kept your existing ${result.skipped.join(", ")}.`);
    }
    cliContext.logger.info(
        "Preview it with `fern docs dev`. To use your company's logo and colors, run `fern docs brand <company>`."
    );
}
