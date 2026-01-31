import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { exec } from "child_process";
import { mkdir, readFile, writeFile } from "fs/promises";
import { PNG } from "pngjs";
import { Browser, launch } from "puppeteer";
import { promisify } from "util";

import { CliContext } from "../../cli-context/CliContext";
import { isCI } from "../../utils/environment";

const execAsync = promisify(exec);

async function openUrlInBrowser(url: string): Promise<void> {
    const platform = process.platform;
    let command: string;

    if (platform === "darwin") {
        command = `open "${url}"`;
    } else if (platform === "win32") {
        command = `start "" "${url}"`;
    } else {
        // Linux and other Unix-like systems
        command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}"`;
    }

    await execAsync(command);
}

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

async function getChangedMdxFilesFromGit(): Promise<string[]> {
    try {
        // Find the merge base - the point where the current branch diverged from its upstream
        let mergeBase: string;
        try {
            // First try to get the upstream tracking branch
            const { stdout: upstream } = await execAsync("git rev-parse --abbrev-ref @{upstream} 2>/dev/null");
            const upstreamBranch = upstream.trim();
            const { stdout: base } = await execAsync(`git merge-base HEAD ${upstreamBranch}`);
            mergeBase = base.trim();
        } catch {
            // If no upstream, try origin/HEAD (the default branch of the remote)
            try {
                const { stdout: base } = await execAsync("git merge-base HEAD origin/HEAD 2>/dev/null");
                mergeBase = base.trim();
            } catch {
                // Last resort: compare against HEAD~10 or just use HEAD if no history
                try {
                    const { stdout: base } = await execAsync("git rev-parse HEAD~10 2>/dev/null");
                    mergeBase = base.trim();
                } catch {
                    mergeBase = "HEAD";
                }
            }
        }

        // Get changed files compared to the merge base
        const { stdout } = await execAsync(`git diff --name-only ${mergeBase}...HEAD -- '*.mdx'`);
        const files = stdout
            .trim()
            .split("\n")
            .filter((file) => file.length > 0);

        // Also include staged and unstaged changes
        const { stdout: stagedStdout } = await execAsync("git diff --name-only --cached -- '*.mdx'");
        const stagedFiles = stagedStdout
            .trim()
            .split("\n")
            .filter((file) => file.length > 0);

        const { stdout: unstagedStdout } = await execAsync("git diff --name-only -- '*.mdx'");
        const unstagedFiles = unstagedStdout
            .trim()
            .split("\n")
            .filter((file) => file.length > 0);

        // Combine and deduplicate
        const allFiles = [...new Set([...files, ...stagedFiles, ...unstagedFiles])];
        return allFiles;
    } catch (error) {
        throw new Error(
            `Failed to get changed files from git: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

async function getMostRecentPreviewUrl(token: string): Promise<string | null> {
    const fdr = createFdrService({ token });

    // Fetch all docs URLs and filter for preview URLs
    const listResponse = await fdr.docs.v2.read.listAllDocsUrls({
        limit: 100
    });

    if (!listResponse.ok) {
        return null;
    }

    // Preview URLs match the pattern: {org}-preview-{hash}.docs.buildwithfern.com
    const previewUrlPattern = /-preview-[a-f0-9-]+\.docs\.buildwithfern\.com$/;

    const previewDeployments = listResponse.body.urls
        .filter((item) => previewUrlPattern.test(item.domain))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (previewDeployments.length === 0) {
        return null;
    }

    // Return the most recent preview URL
    const mostRecent = previewDeployments[0];
    if (mostRecent == null) {
        return null;
    }
    return mostRecent.basePath != null ? `${mostRecent.domain}${mostRecent.basePath}` : mostRecent.domain;
}

function generateDiffHtmlPage({
    diffs,
    outputDir,
    previewUrl,
    productionUrl
}: {
    diffs: DocsDiffResult[];
    outputDir: string;
    previewUrl: string;
    productionUrl: string;
}): string {
    const changedDiffs = diffs.filter((diff) => diff.comparison != null || diff.isNewPage);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fern Docs Diff</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .summary {
            background: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .summary p {
            margin: 5px 0;
        }
        .diff-section {
            background: #fff;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .diff-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        .diff-header h2 {
            margin: 0 0 8px 0;
            font-size: 1.1em;
        }
        .diff-header .file-path {
            font-family: monospace;
            font-size: 0.9em;
            color: #666;
        }
        .diff-links {
            margin-top: 10px;
        }
        .diff-links a {
            display: inline-block;
            margin-right: 15px;
            color: #0066cc;
            text-decoration: none;
            font-size: 0.9em;
        }
        .diff-links a:hover {
            text-decoration: underline;
        }
        .diff-body {
            padding: 20px;
        }
        .diff-image {
            max-width: 100%;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
        }
        .new-page-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .no-changes {
            color: #666;
            font-style: italic;
        }
        .change-percent {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Fern Docs Visual Diff</h1>
        <div class="summary">
            <p><strong>Preview URL:</strong> <a href="https://${previewUrl}" target="_blank">${previewUrl}</a></p>
            <p><strong>Production URL:</strong> <a href="${productionUrl}" target="_blank">${productionUrl}</a></p>
            <p><strong>Total pages with changes:</strong> ${changedDiffs.length}</p>
            <p><strong>Total pages checked:</strong> ${diffs.length}</p>
        </div>
        ${
            changedDiffs.length === 0
                ? '<p class="no-changes">No visual changes detected.</p>'
                : changedDiffs
                      .map(
                          (diff) => `
        <div class="diff-section">
            <div class="diff-header">
                <h2>
                    /${diff.slug}
                    ${diff.isNewPage ? '<span class="new-page-badge">New Page</span>' : ""}
                </h2>
                <div class="file-path">${diff.file}</div>
                <div class="diff-links">
                    <a href="https://${previewUrl}/${diff.slug}" target="_blank">View Preview</a>
                    <a href="${productionUrl}/${diff.slug}" target="_blank">View Production</a>
                </div>
                ${diff.changePercent != null ? `<div class="change-percent">Change: ${diff.changePercent.toFixed(2)}%</div>` : ""}
            </div>
            <div class="diff-body">
                ${
                    diff.comparison != null
                        ? `<img class="diff-image" src="file://${diff.comparison}" alt="Visual diff for ${diff.slug}" />`
                        : diff.isNewPage
                          ? '<p class="no-changes">New page - no production version to compare against.</p>'
                          : '<p class="no-changes">No visual changes detected.</p>'
                }
            </div>
        </div>`
                      )
                      .join("\n")
        }
    </div>
</body>
</html>`;

    return html;
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
    outputDir,
    openInBrowser
}: {
    cliContext: CliContext;
    project: Project;
    previewUrl: string | undefined;
    files: string[] | undefined;
    outputDir: string;
    openInBrowser?: boolean;
}): Promise<DocsDiffOutput> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs workspace found. Make sure you have a docs.yml file.");
        return { diffs: [] };
    }

    // Determine if we should auto-detect files and open in browser
    const shouldAutoDetect = (files == null || files.length === 0) && !isCI();
    const shouldOpenInBrowser = openInBrowser ?? shouldAutoDetect;

    // Get files from git diff if not provided and not in CI
    let filesToDiff: string[];
    if (shouldAutoDetect) {
        cliContext.logger.info("No files provided, detecting changed MDX files from git...");
        filesToDiff = await getChangedMdxFilesFromGit();
        if (filesToDiff.length === 0) {
            cliContext.logger.info("No changed MDX files detected.");
            return { diffs: [] };
        }
        cliContext.logger.info(`Found ${filesToDiff.length} changed MDX file(s): ${filesToDiff.join(", ")}`);
    } else if (files == null || files.length === 0) {
        cliContext.failAndThrow("No files provided. In CI/CD environments, you must specify files explicitly.");
        return { diffs: [] };
    } else {
        filesToDiff = files;
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

    // Auto-detect preview URL if not provided
    let normalizedPreviewUrl: string;
    if (previewUrl == null || previewUrl.length === 0) {
        cliContext.logger.info("No preview URL provided, fetching most recent preview deployment...");
        const detectedPreviewUrl = await getMostRecentPreviewUrl(fernToken);
        if (detectedPreviewUrl == null) {
            cliContext.failAndThrow(
                "No preview URL provided and no preview deployments found. " +
                    "Please provide a preview URL or deploy a preview first using 'fern generate --docs --preview'."
            );
            return { diffs: [] };
        }
        normalizedPreviewUrl = detectedPreviewUrl;
        cliContext.logger.info(`Using preview URL: ${normalizedPreviewUrl}`);
    } else {
        normalizedPreviewUrl = previewUrl;
        if (normalizedPreviewUrl.startsWith("https://")) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(8);
        } else if (normalizedPreviewUrl.startsWith("http://")) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(7);
        }
        const slashIndex = normalizedPreviewUrl.indexOf("/");
        if (slashIndex !== -1) {
            normalizedPreviewUrl = normalizedPreviewUrl.slice(0, slashIndex);
        }
    }

    const slugResponse = await cliContext.runTask(async (context) => {
        context.logger.info(`Resolving slugs for ${filesToDiff.length} file(s)...`);
        return getSlugForFiles({
            previewUrl: normalizedPreviewUrl,
            files: filesToDiff,
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

    // Generate HTML page and open in browser if requested
    if (shouldOpenInBrowser && results.length > 0) {
        const htmlContent = generateDiffHtmlPage({
            diffs: results,
            outputDir,
            previewUrl: normalizedPreviewUrl,
            productionUrl: productionBaseUrl
        });

        const htmlPath = join(outputPath, RelativeFilePath.of("diff-report.html"));
        await writeFile(htmlPath, htmlContent);
        cliContext.logger.info(`Diff report generated: ${htmlPath}`);

        try {
            await openUrlInBrowser(htmlPath);
            cliContext.logger.info("Opened diff report in browser.");
        } catch (error) {
            cliContext.logger.warn(
                `Could not open browser automatically. Please open the report manually: ${htmlPath}`
            );
        }
    }

    return { diffs: results };
}
