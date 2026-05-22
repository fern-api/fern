import type { FernToken } from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";

import { mkdir, readFile, writeFile } from "fs/promises";
import { PNG } from "pngjs";
import { type Browser, launch } from "puppeteer";
import type { Argv } from "yargs";
import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LegacyProjectAdapter } from "../../../docs/adapter/LegacyProjectAdapter.js";
import { command } from "../../_internal/command.js";

// ── Types ────────────────────────────────────────────────────────────────────

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

interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface DiffRegionResult {
    changePercent: number;
    boundingBox: BoundingBox;
    comparisonPath: string;
}

interface ProductionUrlInfo {
    baseUrl: string;
    basePath: string | null;
}

// ── Args & Command ───────────────────────────────────────────────────────────

export declare namespace DiffCommand {
    export interface Args extends GlobalArgs {
        "preview-url": string;
        files: string[];
        output: string;
    }
}

export class DiffCommand {
    public async handle(context: Context, args: DiffCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message: "No docs workspace found. Make sure you have a docs.yml file.",
                code: CliError.Code.ConfigError
            });
        }

        const adapter = new LegacyProjectAdapter({ context });
        const project = await adapter.adapt(workspace);

        const result = await this.runDiff({
            context,
            project,
            previewUrl: args["preview-url"],
            files: args.files ?? [],
            outputDir: args.output
        });

        context.stdout.info(JSON.stringify(result, null, 2));
    }

    private async runDiff({
        context,
        project,
        previewUrl,
        files,
        outputDir
    }: {
        context: Context;
        project: Project;
        previewUrl: string;
        files: string[];
        outputDir: string;
    }): Promise<DocsDiffOutput> {
        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            throw new CliError({
                message: "No docs workspace found. Make sure you have a docs.yml file.",
                code: CliError.Code.ConfigError
            });
        }

        const taskContext = new TaskContextAdapter({ context });
        const token: FernToken | null = await askToLogin(taskContext);

        if (token == null) {
            throw new CliError({
                message: "Failed to authenticate. Please run 'fern login' first.",
                code: CliError.Code.AuthError
            });
        }

        const fernToken = process.env.FERN_TOKEN ?? token.value;
        const productionUrlInfo = getProductionUrlInfo(docsWorkspace.config);

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

        context.stderr.info(`Resolving slugs for ${files.length} file(s)...`);
        const slugResponse = await getSlugForFiles({
            previewUrl: normalizedPreviewUrl,
            files,
            token: fernToken
        });

        if (slugResponse.authed) {
            context.stderr.warn(
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

        context.stderr.info("Starting browser for screenshot capture...");

        const browser = await launch({
            headless: true,
            args: ["--ignore-certificate-errors", "--no-sandbox", "--disable-setuid-sandbox"]
        });

        try {
            for (const mapping of slugResponse.mappings) {
                if (mapping.slug == null) {
                    context.stderr.warn(`Could not find slug for file: ${mapping.filePath}`);
                    continue;
                }

                const slug = mapping.slug;
                const filename = slugToFilename(slug);

                const beforePath = join(outputPath, RelativeFilePath.of(`${filename}-before.png`));
                const afterPath = join(outputPath, RelativeFilePath.of(`${filename}-after.png`));
                const comparisonBasePath = join(outputPath, RelativeFilePath.of(`${filename}-comparison.png`));

                const productionUrl = `${productionUrlInfo.baseUrl}/${slug}`;
                const previewPageUrl = `https://${normalizedPreviewUrl}/${slug}`;

                context.stderr.info(`Capturing screenshots for: ${slug}`);

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
                    context.stderr.warn(`Could not capture preview page for: ${slug}`);
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
                        context.stderr.info("  No visual changes detected");
                        results.push({
                            file: mapping.filePath,
                            slug,
                            comparison: null,
                            changePercent: 0,
                            isNewPage
                        });
                    } else {
                        for (const [idx, region] of regions.entries()) {
                            context.stderr.info(
                                `  Region ${idx + 1}: ${region.changePercent.toFixed(2)}% (split & cropped)`
                            );
                            results.push({
                                file: mapping.filePath,
                                slug,
                                comparison: region.comparisonPath,
                                changePercent: region.changePercent,
                                isNewPage
                            });
                        }
                    }
                } else {
                    context.stderr.info("  New page (no production version)");
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

        return { diffs: results };
    }
}

export function addDiffCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new DiffCommand();
    command(
        cli,
        "diff <preview-url> <files..>",
        "Generate visual diffs between preview and production docs pages",
        (context, args) => cmd.handle(context, args as DiffCommand.Args),
        (yargs) =>
            yargs
                .positional("preview-url", {
                    type: "string",
                    description: "The preview deployment URL (e.g. acme-preview-abc123.docs.buildwithfern.com)",
                    demandOption: true
                })
                .positional("files", {
                    type: "string",
                    array: true,
                    description: "File paths to generate diffs for (e.g. fern/pages/intro.mdx)",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    default: ".fern/diff",
                    description: "Output directory for diff images"
                })
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
        throw new CliError({
            message: `Failed to get slugs for files: ${response.status} ${response.statusText} - ${errorText}`,
            code: CliError.Code.InternalError
        });
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
    } catch {
        await page.close();
        return false;
    }
}

function slugToFilename(slug: string): string {
    return slug.replace(/\//g, "-");
}

function rowHasDifference(
    beforeData: Uint8Array,
    afterData: Uint8Array,
    beforeY: number,
    afterY: number,
    width: number,
    thresholdValue: number
): boolean {
    for (let x = 0; x < width; x++) {
        const beforeIdx = (beforeY * width + x) * 4;
        const afterIdx = (afterY * width + x) * 4;
        const rDiff = Math.abs((beforeData[beforeIdx] ?? 0) - (afterData[afterIdx] ?? 0));
        const gDiff = Math.abs((beforeData[beforeIdx + 1] ?? 0) - (afterData[afterIdx + 1] ?? 0));
        const bDiff = Math.abs((beforeData[beforeIdx + 2] ?? 0) - (afterData[afterIdx + 2] ?? 0));
        if (rDiff > thresholdValue || gDiff > thresholdValue || bDiff > thresholdValue) {
            return true;
        }
    }
    return false;
}

function findChangedRegions(
    beforeData: Uint8Array,
    afterData: Uint8Array,
    width: number,
    height: number,
    beforeOriginalHeight: number,
    afterOriginalHeight: number,
    threshold: number = 0.1,
    minArea: number = 5000,
    buffer: number = 100
): BoundingBox[] {
    const thresholdValue = Math.floor(threshold * 255);

    let firstChangeY = -1;
    const minOriginalHeight = Math.min(beforeOriginalHeight, afterOriginalHeight);
    for (let y = 0; y < minOriginalHeight; y++) {
        if (rowHasDifference(beforeData, afterData, y, y, width, thresholdValue)) {
            firstChangeY = y;
            break;
        }
    }

    if (firstChangeY === -1) {
        if (beforeOriginalHeight !== afterOriginalHeight) {
            firstChangeY = minOriginalHeight;
        } else {
            return [];
        }
    }

    const minConsecutiveRows = 20;
    let lastChangeY = firstChangeY;
    const maxOriginalHeight = Math.max(beforeOriginalHeight, afterOriginalHeight);

    for (let y = 0; y < maxOriginalHeight; y++) {
        const beforeY = beforeOriginalHeight - 1 - y;
        const afterY = afterOriginalHeight - 1 - y;

        if (beforeY < 0 || afterY < 0) {
            lastChangeY = Math.max(beforeOriginalHeight, afterOriginalHeight) - 1 - y + 1;
            break;
        }

        if (rowHasDifference(beforeData, afterData, beforeY, afterY, width, thresholdValue)) {
            let consecutiveCount = 1;
            for (let checkY = y + 1; checkY < Math.min(y + minConsecutiveRows, maxOriginalHeight); checkY++) {
                const checkBeforeY = beforeOriginalHeight - 1 - checkY;
                const checkAfterY = afterOriginalHeight - 1 - checkY;
                if (checkBeforeY < 0 || checkAfterY < 0) {
                    consecutiveCount++;
                    continue;
                }
                if (rowHasDifference(beforeData, afterData, checkBeforeY, checkAfterY, width, thresholdValue)) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }

            if (consecutiveCount >= minConsecutiveRows) {
                lastChangeY = Math.min(beforeY, afterY);
                break;
            }
        }
    }

    if (lastChangeY < firstChangeY) {
        lastChangeY = firstChangeY;
    }

    const startY = Math.max(0, firstChangeY - buffer);
    const endY = Math.min(height - 1, lastChangeY + buffer);

    const minXBuffer = 100;
    let minX = width;
    let maxX = 0;
    for (let y = firstChangeY; y <= Math.min(lastChangeY, height - 1); y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const rDiff = Math.abs((beforeData[idx] ?? 0) - (afterData[idx] ?? 0));
            const gDiff = Math.abs((beforeData[idx + 1] ?? 0) - (afterData[idx + 1] ?? 0));
            const bDiff = Math.abs((beforeData[idx + 2] ?? 0) - (afterData[idx + 2] ?? 0));
            if (rDiff > thresholdValue || gDiff > thresholdValue || bDiff > thresholdValue) {
                if (x < minX) {
                    minX = x;
                }
                if (x > maxX) {
                    maxX = x;
                }
            }
        }
    }

    if (minX > maxX) {
        minX = 0;
        maxX = width - 1;
    } else {
        minX = Math.max(0, minX - minXBuffer);
        maxX = Math.min(width - 1, maxX + minXBuffer);
    }

    const box: BoundingBox = { minX, minY: startY, maxX, maxY: endY };
    const area = (box.maxX - box.minX) * (box.maxY - box.minY);
    if (area < minArea) {
        return [];
    }

    return [box];
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
): void {
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
        const color: [number, number, number, number] = [255, 196, 0, 255];
        const thickness = 3;
        drawBorder(combined, 0, 0, beforePng.width, beforePng.height, color, thickness);
        drawBorder(combined, beforePng.width + gap, 0, afterPng.width, afterPng.height, color, thickness);
    }

    return combined;
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

    const beforeOriginalHeight = beforePng.height;
    const afterOriginalHeight = afterPng.height;

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

    const regions = findChangedRegions(beforeData, afterData, width, height, beforeOriginalHeight, afterOriginalHeight);

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

function getProductionUrlInfo(docsConfig: {
    instances: Array<{ url: string; "custom-domain"?: string }> | undefined;
}): ProductionUrlInfo {
    if (docsConfig.instances == null || docsConfig.instances.length === 0) {
        throw new CliError({ message: "No docs instances configured in docs.yml", code: CliError.Code.InternalError });
    }

    const firstInstance = docsConfig.instances[0];
    if (firstInstance == null) {
        throw new CliError({ message: "No docs instances configured in docs.yml", code: CliError.Code.InternalError });
    }

    const instanceUrl = firstInstance["custom-domain"] ?? firstInstance.url;

    let normalizedUrl = instanceUrl;
    if (!normalizedUrl.startsWith("https://") && !normalizedUrl.startsWith("http://")) {
        normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
        const url = new URL(normalizedUrl);
        const basePath = url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : null;
        const baseUrl = `${url.protocol}//${url.host}`;
        return { baseUrl, basePath };
    } catch {
        return { baseUrl: normalizedUrl, basePath: null };
    }
}
