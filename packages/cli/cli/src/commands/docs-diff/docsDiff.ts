import { FernToken } from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { mkdir, readFile, writeFile } from "fs/promises";
import { PNG } from "pngjs";
import { Browser, launch } from "puppeteer";

import { CliContext } from "../../cli-context/CliContext";

interface FileSlugMapping {
    filePath: string;
    slug: string | null;
}

interface GetSlugForFileResponse {
    mappings: FileSlugMapping[];
    authed: boolean;
}

export interface DocsDiffResult {
    file: string;
    slug: string;
    before: string | null;
    after: string;
    diff: string | null;
    changePercent: number | null;
}

export interface DocsDiffOutput {
    diffs: DocsDiffResult[];
}

async function getSlugForFiles({
    previewUrl,
    files,
    token
}: {
    previewUrl: string;
    files: string[];
    token: string;
}): Promise<GetSlugForFileResponse> {
    const filesParam = files.join(",");
    const url = `https://${previewUrl}/api/fern-docs/get-slug-for-file?files=${encodeURIComponent(filesParam)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            FERN_TOKEN: token
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get slugs for files: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return (await response.json()) as GetSlugForFileResponse;
}

async function captureScreenshot({
    browser,
    url,
    outputPath,
    token
}: {
    browser: Browser;
    url: string;
    outputPath: string;
    token?: string;
}): Promise<boolean> {
    const page = await browser.newPage();

    try {
        await page.setViewport({
            width: 1440,
            height: 900,
            deviceScaleFactor: 2
        });

        if (token) {
            await page.setExtraHTTPHeaders({
                FERN_TOKEN: token
            });
        }

        const response = await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000
        });

        if (!response || response.status() === 404) {
            await page.close();
            return false;
        }

        await page.screenshot({
            path: outputPath as `${string}.png`,
            fullPage: true
        });

        await page.close();
        return true;
    } catch (error) {
        await page.close();
        return false;
    }
}

function slugToFilename(slug: string): string {
    return slug.replace(/\//g, "-");
}

async function generateDiff({
    beforePath,
    afterPath,
    diffPath
}: {
    beforePath: string;
    afterPath: string;
    diffPath: string;
}): Promise<number> {
    // pixelmatch v6 is ESM-only, so we need to use dynamic import
    const pixelmatchModule = await import("pixelmatch");
    const pixelmatch = pixelmatchModule.default as (
        img1: Uint8Array,
        img2: Uint8Array,
        output: Uint8Array,
        width: number,
        height: number,
        options?: { threshold?: number }
    ) => number;

    const beforePng = PNG.sync.read(await readFile(beforePath));
    const afterPng = PNG.sync.read(await readFile(afterPath));

    const width = Math.max(beforePng.width, afterPng.width);
    const height = Math.max(beforePng.height, afterPng.height);

    const resizedBefore = new PNG({ width, height });
    const resizedAfter = new PNG({ width, height });

    resizedBefore.data.fill(255);
    resizedAfter.data.fill(255);

    PNG.bitblt(beforePng, resizedBefore, 0, 0, beforePng.width, beforePng.height, 0, 0);
    PNG.bitblt(afterPng, resizedAfter, 0, 0, afterPng.width, afterPng.height, 0, 0);

    const diffPng = new PNG({ width, height });

    // Convert Buffer to Uint8Array for pixelmatch compatibility
    const beforeData = new Uint8Array(
        resizedBefore.data.buffer,
        resizedBefore.data.byteOffset,
        resizedBefore.data.length
    );
    const afterData = new Uint8Array(resizedAfter.data.buffer, resizedAfter.data.byteOffset, resizedAfter.data.length);
    const diffData = new Uint8Array(diffPng.data.buffer, diffPng.data.byteOffset, diffPng.data.length);

    const numDiffPixels = pixelmatch(beforeData, afterData, diffData, width, height, {
        threshold: 0.1
    });

    const pngBuffer = PNG.sync.write(diffPng);
    await writeFile(diffPath, new Uint8Array(pngBuffer));

    const totalPixels = width * height;
    return (numDiffPixels / totalPixels) * 100;
}

function getProductionUrl(docsConfig: { instances: Array<{ url: string }> | undefined }): string {
    if (docsConfig.instances == null || docsConfig.instances.length === 0) {
        throw new Error("No docs instances configured in docs.yml");
    }

    const firstInstance = docsConfig.instances[0];
    if (firstInstance == null) {
        throw new Error("No docs instances configured in docs.yml");
    }

    const instanceUrl = firstInstance.url;

    if (instanceUrl.startsWith("https://") || instanceUrl.startsWith("http://")) {
        return instanceUrl;
    }

    return `https://${instanceUrl}`;
}

export async function docsDiff({
    cliContext,
    project,
    previewUrl,
    files,
    outputDir
}: {
    cliContext: CliContext;
    project: Project;
    previewUrl: string;
    files: string[];
    outputDir: string;
}): Promise<DocsDiffOutput> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs workspace found. Make sure you have a docs.yml file.");
        return { diffs: [] };
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return { diffs: [] };
    }

    const fernToken = process.env.FERN_TOKEN ?? token.value;

    const productionBaseUrl = getProductionUrl(docsWorkspace.config);

    let normalizedPreviewUrl = previewUrl;
    if (normalizedPreviewUrl.startsWith("https://")) {
        normalizedPreviewUrl = normalizedPreviewUrl.slice(8);
    } else if (normalizedPreviewUrl.startsWith("http://")) {
        normalizedPreviewUrl = normalizedPreviewUrl.slice(7);
    }
    const slashIndex = normalizedPreviewUrl.indexOf("/");
    if (slashIndex !== -1) {
        normalizedPreviewUrl = normalizedPreviewUrl.slice(0, slashIndex);
    }

    const slugResponse = await cliContext.runTask(async (context) => {
        context.logger.info(`Resolving slugs for ${files.length} file(s)...`);
        return getSlugForFiles({
            previewUrl: normalizedPreviewUrl,
            files,
            token: fernToken
        });
    });

    if (slugResponse.authed) {
        cliContext.logger.warn(
            "The docs require authentication. Screenshots may not capture the full content without proper auth."
        );
    }

    const outputPath = AbsoluteFilePath.of(
        outputDir.startsWith("/") ? outputDir : join(cwd(), RelativeFilePath.of(outputDir))
    );

    if (!(await doesPathExist(outputPath))) {
        await mkdir(outputPath, { recursive: true });
    }

    const results: DocsDiffResult[] = [];

    await cliContext.runTask(async (context) => {
        context.logger.info("Starting browser for screenshot capture...");

        const browser = await launch({
            headless: true,
            args: ["--ignore-certificate-errors", "--no-sandbox", "--disable-setuid-sandbox"]
        });

        try {
            for (const mapping of slugResponse.mappings) {
                if (mapping.slug == null) {
                    context.logger.warn(`Could not find slug for file: ${mapping.filePath}`);
                    continue;
                }

                const slug = mapping.slug;
                const filename = slugToFilename(slug);

                const beforePath = join(outputPath, RelativeFilePath.of(`${filename}-before.png`));
                const afterPath = join(outputPath, RelativeFilePath.of(`${filename}-after.png`));
                const diffPath = join(outputPath, RelativeFilePath.of(`${filename}-diff.png`));

                const productionUrl = `${productionBaseUrl}/${slug}`;
                const previewPageUrl = `https://${normalizedPreviewUrl}/${slug}`;

                context.logger.info(`Capturing screenshots for: ${slug}`);

                const beforeExists = await captureScreenshot({
                    browser,
                    url: productionUrl,
                    outputPath: beforePath,
                    token: fernToken
                });

                const afterExists = await captureScreenshot({
                    browser,
                    url: previewPageUrl,
                    outputPath: afterPath,
                    token: fernToken
                });

                if (!afterExists) {
                    context.logger.warn(`Could not capture preview page for: ${slug}`);
                    continue;
                }

                let changePercent: number | null = null;
                let diffPathResult: string | null = null;

                if (beforeExists) {
                    changePercent = await generateDiff({
                        beforePath,
                        afterPath,
                        diffPath
                    });
                    diffPathResult = diffPath;
                    context.logger.info(`  Change: ${changePercent.toFixed(2)}%`);
                } else {
                    context.logger.info(`  New page (no production version)`);
                }

                results.push({
                    file: mapping.filePath,
                    slug,
                    before: beforeExists ? beforePath : null,
                    after: afterPath,
                    diff: diffPathResult,
                    changePercent
                });
            }
        } finally {
            await browser.close();
        }
    });

    return { diffs: results };
}
