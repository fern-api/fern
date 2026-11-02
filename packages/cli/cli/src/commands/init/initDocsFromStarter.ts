import { defaultDocsSiteChoices, getDocsStarter, layoutFromFlag, scaffoldDocsSite } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";

/**
 * `fern init --docs --template <layout>`: a docs site from Fern's docs starter (the Fern Dashboard's
 * onboarding template), downloaded on first use.
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
    cliContext.logger.info("Downloading Fern's docs starter...");
    const templateDir = await getDocsStarter();
    const result = await scaffoldDocsSite({
        dir: process.cwd(),
        org: organization,
        choices: defaultDocsSiteChoices(organization, layout),
        templateDir,
        fernVersion: cliContext.environment.packageVersion
    });
    cliContext.logger.info(`Created your docs site in fern/ (${result.written.length} files).`);
    if (result.skipped.length > 0) {
        cliContext.logger.info(`Kept your existing ${result.skipped.join(", ")}.`);
    }
    cliContext.logger.info(
        "Preview it with `fern docs dev`. To use your company's logo and colors, run `fern docs brand <company>`."
    );
}
