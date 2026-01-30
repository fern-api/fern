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

            const rDiff = Math.abs((beforeData[idx] ?? 0) - (afterData[idx] ?? 0));
            const gDiff = Math.abs((beforeData[idx + 1] ?? 0) - (afterData[idx + 1] ?? 0));
            const bDiff = Math.abs((beforeData[idx + 2] ?? 0) - (afterData[idx + 2] ?? 0));

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

function findChangedRegions(
    beforeData: Uint8Array,
    afterData: Uint8Array,
    width: number,
    height: number,
    threshold: number = 0.1,
    minArea: number = 5000,
    gapRows: number = 200
): BoundingBox[] {
    const thresholdValue = Math.floor(threshold * 255);
    const rowHasDiff: boolean[] = new Array(height).fill(false);

    for (let y = 0; y < height; y++) {
        let has = false;
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const rDiff = Math.abs((beforeData[idx] ?? 0) - (afterData[idx] ?? 0));
            const gDiff = Math.abs((beforeData[idx + 1] ?? 0) - (afterData[idx + 1] ?? 0));
            const bDiff = Math.abs((beforeData[idx + 2] ?? 0) - (afterData[idx + 2] ?? 0));
            if (rDiff > thresholdValue || gDiff > thresholdValue || bDiff > thresholdValue) {
                has = true;
                break;
            }
        }
        rowHasDiff[y] = has;
    }

    const boxes: BoundingBox[] = [];
    let y = 0;
    while (y < height) {
        while (y < height && !rowHasDiff[y]) {
            y++;
        }
        if (y >= height) {
            break;
        }
        let startY = y;
        let lastDiffY = y;
        y++;
        while (y < height) {
            if (rowHasDiff[y]) {
                lastDiffY = y;
                y++;
            } else {
                // allow small gaps within a region up to gapRows
                let gap = 0;
                while (y < height && !rowHasDiff[y] && gap < gapRows) {
                    gap++;
                    y++;
                }
                if (y < height && rowHasDiff[y]) {
                    lastDiffY = y;
                    y++;
                } else {
                    break;
                }
            }
        }
        const endY = lastDiffY;

        let minX = width;
        let maxX = 0;
        for (let yy = startY; yy <= endY; yy++) {
            for (let xx = 0; xx < width; xx++) {
                const idx = (yy * width + xx) * 4;
                const rDiff = Math.abs((beforeData[idx] ?? 0) - (afterData[idx] ?? 0));
                const gDiff = Math.abs((beforeData[idx + 1] ?? 0) - (afterData[idx + 1] ?? 0));
                const bDiff = Math.abs((beforeData[idx + 2] ?? 0) - (afterData[idx + 2] ?? 0));
                if (rDiff > thresholdValue || gDiff > thresholdValue || bDiff > thresholdValue) {
                    if (xx < minX) {
                        minX = xx;
                    }
                    if (xx > maxX) {
                        maxX = xx;
                    }
                }
            }
        }
        if (minX <= maxX) {
            const box: BoundingBox = { minX, minY: startY, maxX, maxY: endY };
            const area = (box.maxX - box.minX) * (box.maxY - box.minY);
            if (area >= minArea) {
                boxes.push(box);
            }
        }
    }

    return boxes;
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

function drawBorder(
    png: PNG,
    x: number,
    y: number,
    w: number,
    h: number,
    color: [number, number, number, number],
    thickness: number
) {
    const [r, g, b, a] = color;
    for (let t = 0; t < thickness; t++) {
        for (let xx = x; xx < x + w; xx++) {
            const topIdx = ((y + t) * png.width + xx) * 4;
            const botIdx = ((y + h - 1 - t) * png.width + xx) * 4;
            png.data[topIdx] = r;
            png.data[topIdx + 1] = g;
            png.data[topIdx + 2] = b;
            png.data[topIdx + 3] = a;
            png.data[botIdx] = r;
            png.data[botIdx + 1] = g;
            png.data[botIdx + 2] = b;
            png.data[botIdx + 3] = a;
        }
        for (let yy = y; yy < y + h; yy++) {
            const leftIdx = (yy * png.width + (x + t)) * 4;
            const rightIdx = (yy * png.width + (x + w - 1 - t)) * 4;
            png.data[leftIdx] = r;
            png.data[leftIdx + 1] = g;
            png.data[leftIdx + 2] = b;
            png.data[leftIdx + 3] = a;
            png.data[rightIdx] = r;
            png.data[rightIdx + 1] = g;
            png.data[rightIdx + 2] = b;
            png.data[rightIdx + 3] = a;
        }
    }
}

function createSideBySideComparison(beforePng: PNG, afterPng: PNG, gap: number = 20, highlight: boolean = true): PNG {
    const totalWidth = beforePng.width + gap + afterPng.width;
    const totalHeight = Math.max(beforePng.height, afterPng.height);

    const combined = new PNG({ width: totalWidth, height: totalHeight });

    combined.data.fill(255);

    PNG.bitblt(beforePng, combined, 0, 0, beforePng.width, beforePng.height, 0, 0);

    PNG.bitblt(afterPng, combined, 0, 0, afterPng.width, afterPng.height, beforePng.width + gap, 0);

    if (highlight) {
        const color: [number, number, number, number] = [255, 196, 0, 255]; // subtle amber
        const thickness = 3;
        drawBorder(combined, 0, 0, beforePng.width, beforePng.height, color, thickness);
        drawBorder(combined, beforePng.width + gap, 0, afterPng.width, afterPng.height, color, thickness);
    }

    return combined;
}

interface DiffRegionResult {
    changePercent: number;
    boundingBox: BoundingBox;
    comparisonPath: string;
}

async function generateComparisons({
    beforePath,
    afterPath,
    comparisonBasePath
}: {
    beforePath: string;
    afterPath: string;
    comparisonBasePath: string;
}): Promise<DiffRegionResult[]> {
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

    const regions = findChangedRegions(beforeData, afterData, width, height);

    const results: DiffRegionResult[] = [];
    if (regions.length === 0) {
        return results;
    }

    const base = comparisonBasePath.endsWith(".png")
        ? comparisonBasePath.slice(0, comparisonBasePath.length - 4)
        : comparisonBasePath;

    for (let i = 0; i < regions.length; i++) {
        const boundingBox = regions[i];
        if (boundingBox == null) {
            continue;
        }
        const boxWidth = boundingBox.maxX - boundingBox.minX;
        const boxHeight = boundingBox.maxY - boundingBox.minY;
        const changedPixels = boxWidth * boxHeight;
        const totalPixels = width * height;
        const changePercent = (changedPixels / totalPixels) * 100;

        const croppedBefore = cropPng(resizedBefore, boundingBox);
        const croppedAfter = cropPng(resizedAfter, boundingBox);
        const sideBySide = createSideBySideComparison(croppedBefore, croppedAfter, 20, true);

        const outPath = `${base}-region-${i + 1}.png`;
        const pngBuffer = PNG.sync.write(sideBySide);
        await writeFile(outPath, new Uint8Array(pngBuffer));

        results.push({ changePercent, boundingBox, comparisonPath: outPath });
    }

    return results;
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
                const comparisonBasePath = join(outputPath, RelativeFilePath.of(`${filename}-comparison.png`));

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

                const isNewPage = !beforeExists;

                if (beforeExists) {
                    const regions = await generateComparisons({
                        beforePath,
                        afterPath,
                        comparisonBasePath
                    });

                    if (regions.length === 0) {
                        context.logger.info(`  No visual changes detected`);
                        results.push({
                            file: mapping.filePath,
                            slug,
                            comparison: null,
                            changePercent: 0,
                            isNewPage
                        });
                    } else {
                        regions.forEach((region, idx) => {
                            context.logger.info(
                                `  Region ${idx + 1}: ${region.changePercent.toFixed(2)}% (split & cropped)`
                            );
                            results.push({
                                file: mapping.filePath,
                                slug,
                                comparison: region.comparisonPath,
                                changePercent: region.changePercent,
                                isNewPage
                            });
                        });
                    }
                } else {
                    context.logger.info(`  New page (no production version)`);
                    results.push({
                        file: mapping.filePath,
                        slug,
                        comparison: null,
                        changePercent: null,
                        isNewPage
                    });
                }
            }
        } finally {
            await browser.close();
        }
    });

    return { diffs: results };
}
