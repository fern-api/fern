import { Browser } from "puppeteer";

import { docsYml } from "@fern-api/configuration";
import { stripLeadingSlash } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { findLogosFromHtml } from "../../extract/logo";

const LOGO_DEFAULT_HEIGHT = 28;

export async function getLogos(
    url: string | URL,
    browser: Browser | undefined
): Promise<docsYml.RawSchemas.LogoConfiguration | undefined> {
    url = new URL(url);
    const filepaths: Array<string> = [];

    if (browser) {
        const htmls: Array<string> = [];

        try {
            const page = await browser.newPage();
            await page.goto(url.toString(), {
                waitUntil: "networkidle2"
            });

            htmls.push(await page.content());
            await page.click(".rm-ThemeToggle");
            htmls.push(await page.content());
            // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        } catch {}

        await Promise.all(
            htmls.map(async (html) => {
                return await findLogosFromHtml(html, filepaths);
            })
        );
    }
    const uniqueFilepaths = [...new Set(filepaths).values()];

    if (uniqueFilepaths.length === 0) {
        return undefined;
    }

    if (uniqueFilepaths.length === 1 && uniqueFilepaths[0] != null) {
        const relativeFilepath = RelativeFilePath.of(stripLeadingSlash(uniqueFilepaths[0]));
        return {
            light: relativeFilepath,
            dark: relativeFilepath,
            height: LOGO_DEFAULT_HEIGHT
        };
    }

    if (uniqueFilepaths[0] != null && uniqueFilepaths[1] != null) {
        const relativeFilepathToLight = RelativeFilePath.of(stripLeadingSlash(uniqueFilepaths[0]));
        const relativeFilepathToDark = RelativeFilePath.of(stripLeadingSlash(uniqueFilepaths[1]));
        return {
            light: relativeFilepathToLight,
            dark: relativeFilepathToDark,
            height: LOGO_DEFAULT_HEIGHT
        };
    }

    return undefined;
}
