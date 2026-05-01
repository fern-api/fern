import { CliError } from "@fern-api/task-context";
import { Browser, launch } from "puppeteer";

const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const headers = {
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Connection: "keep-alive"
};

async function exponentialBackoff<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
    factor: number = 2
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return exponentialBackoff(operation, retries - 1, delay * factor, factor);
        } else {
            throw error;
        }
    }
}

export async function startPuppeteer(): Promise<Browser> {
    try {
        return await launch({ headless: true, args: ["--ignore-certificate-errors"] });
    } catch (error) {
        throw new CliError({ message: "Could not create a Puppeteer instance", code: CliError.Code.EnvironmentError });
    }
}

export async function getHtmlWithPuppeteer(browser: Browser, url: string | URL): Promise<string | undefined> {
    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: 3072,
            height: 2048,
            deviceScaleFactor: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: true
        });
        await page.setExtraHTTPHeaders(headers);
        await page.setUserAgent(userAgent);
        await page.setJavaScriptEnabled(true);

        await exponentialBackoff(() =>
            page.goto(url.toString(), {
                waitUntil: "networkidle2",
                timeout: 30000
            })
        );
        const content = (await exponentialBackoff(() => page.content())) as string;
        await page.close();
        return content;
    } catch (error) {
        throw new CliError({ message: "Failed to download page from Puppeteer", code: CliError.Code.NetworkError });
    }
}

async function fetchPageResponse(url: string | URL): Promise<string> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new CliError({ message: `${res.status} ${res.statusText}`, code: CliError.Code.NetworkError });
        }
        return await res.text();
    } catch (error) {
        throw new CliError({ message: "Failed to fetch page from source", code: CliError.Code.NetworkError });
    }
}

export async function fetchPageHtml({ url, browser }: { url: string | URL; browser?: Browser }): Promise<string> {
    try {
        let res: string | undefined = undefined;
        if (browser) {
            res = await getHtmlWithPuppeteer(browser, url);
        } else {
            res = await exponentialBackoff(() => fetchPageResponse(url));
        }
        if (res) {
            return res;
        }
        throw new CliError({ message: "An unknown error occurred.", code: CliError.Code.NetworkError });
    } catch (error) {
        throw new CliError({
            message: `Error retrieving HTML for ${url.toString()}`,
            code: CliError.Code.NetworkError
        });
    }
}

export async function fetchImage(url: string): Promise<NodeJS.TypedArray> {
    try {
        const res = await exponentialBackoff(() => fetch(url));
        if (!res.ok) {
            throw new CliError({ message: `${res.status} ${res.statusText}`, code: CliError.Code.NetworkError });
        }

        const imageBuffer = await res.arrayBuffer();
        const imageData = new Uint8Array(imageBuffer);

        return imageData;
    } catch (error) {
        throw new CliError({
            message: `Failed to retrieve image from source url ${url}`,
            code: CliError.Code.NetworkError
        });
    }
}
