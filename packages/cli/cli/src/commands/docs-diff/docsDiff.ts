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
    comparison: string | null;
    changePercent: number | null;
    isNewPage: boolean;
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

interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function findChangedRegionBoundingBox(
    beforeData: Uint8Array,
    afterData: Uint8Array,
    width: number,
    height: number,
    threshold: number = 0.1
): BoundingBox | null {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasChanges = false;

    const thresholdValue = Math.floor(threshold * 255);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            const rDiff = Math.abs(beforeData[idx] - afterData[idx]);
            const gDiff = Math.abs(beforeData[idx + 1] - afterData[idx + 1]);
            const bDiff = Math.abs(beforeData[idx + 2] - afterData[idx + 2]);

            if (rDiff > thresholdValue || gDiff > thresholdValue || bDiff > thresholdValue) {
                hasChanges = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (!hasChanges) {
        return null;
    }

    return { minX, minY, maxX, maxY };
}

function cropPng(png: PNG, box: BoundingBox, padding: number = 50): PNG {
    const x1 = Math.max(0, box.minX - padding);
    const y1 = Math.max(0, box.minY - padding);
    const x2 = Math.min(png.width, box.maxX + padding);
    const y2 = Math.min(png.height, box.maxY + padding);

    const croppedWidth = x2 - x1;
    const croppedHeight = y2 - y1;

    const cropped = new PNG({ width: croppedWidth, height: croppedHeight });
    PNG.bitblt(png, cropped, x1, y1, croppedWidth, croppedHeight, 0, 0);

    return cropped;
}

function createSideBySideComparison(beforePng: PNG, afterPng: PNG, gap: number = 20): PNG {
    const totalWidth = beforePng.width + gap + afterPng.width;
    const totalHeight = Math.max(beforePng.height, afterPng.height);

    const combined = new PNG({ width: totalWidth, height: totalHeight });

    combined.data.fill(255);

    PNG.bitblt(beforePng, combined, 0, 0, beforePng.width, beforePng.height, 0, 0);

    PNG.bitblt(afterPng, combined, 0, 0, afterPng.width, afterPng.height, beforePng.width + gap, 0);

    return combined;
}

interface DiffResult {
    changePercent: number;
    boundingBox: BoundingBox | null;
}

async function generateComparison({
    beforePath,
    afterPath,
    comparisonPath
}: {
    beforePath: string;
    afterPath: string;
    comparisonPath: string;
}): Promise<DiffResult> {
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

    const beforeData = new Uint8Array(
        resizedBefore.data.buffer,
        resizedBefore.data.byteOffset,
        resizedBefore.data.length
    );
    const afterData = new Uint8Array(resizedAfter.data.buffer, resizedAfter.data.byteOffset, resizedAfter.data.length);

    const boundingBox = findChangedRegionBoundingBox(beforeData, afterData, width, height);

    if (boundingBox == null) {
        return { changePercent: 0, boundingBox: null };
    }

    const boxWidth = boundingBox.maxX - boundingBox.minX;
    const boxHeight = boundingBox.maxY - boundingBox.minY;
    const changedPixels = boxWidth * boxHeight;
    const totalPixels = width * height;
    const changePercent = (changedPixels / totalPixels) * 100;

    const croppedBefore = cropPng(resizedBefore, boundingBox);
    const croppedAfter = cropPng(resizedAfter, boundingBox);

    const sideBySide = createSideBySideComparison(croppedBefore, croppedAfter);

    const pngBuffer = PNG.sync.write(sideBySide);
    await writeFile(comparisonPath, new Uint8Array(pngBuffer));

    return { changePercent, boundingBox };
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
                const comparisonPath = join(outputPath, RelativeFilePath.of(`${filename}-comparison.png`));

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
                let comparisonPathResult: string | null = null;
                const isNewPage = !beforeExists;

                if (beforeExists) {
                    const diffResult = await generateComparison({
                        beforePath,
                        afterPath,
                        comparisonPath
                    });
                    changePercent = diffResult.changePercent;
                    if (diffResult.boundingBox != null) {
                        comparisonPathResult = comparisonPath;
                        context.logger.info(`  Change: ${changePercent.toFixed(2)}% (cropped to changed region)`);
                    } else {
                        context.logger.info(`  No visual changes detected`);
                    }
                } else {
                    context.logger.info(`  New page (no production version)`);
                }

                results.push({
                    file: mapping.filePath,
                    slug,
                    comparison: comparisonPathResult,
                    changePercent,
                    isNewPage
                });
            }
        } finally {
            await browser.close();
        }
    });

    return { diffs: results };
}
