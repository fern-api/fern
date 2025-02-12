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
        return await launch({ headless: "new", ignoreHTTPSErrors: true });
    } catch (error) {
        throw new Error("Could not create a Puppeteer instance");
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
        throw new Error("Failed to download page from Puppeteer");
    }
}

async function fetchPageResponse(url: string | URL): Promise<string> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
        }
        return await res.text();
    } catch (error) {
        throw new Error("Failed to fetch page from source");
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
        throw new Error("An unknown error occurred.");
    } catch (error) {
        throw new Error(`Error retrieving HTML for ${url.toString()}`);
    }
}

export async function fetchImage(url: string): Promise<NodeJS.TypedArray> {
    try {
        const res = await exponentialBackoff(() => fetch(url));
        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
        }

        const imageBuffer = await res.arrayBuffer();
        const imageData = new Uint8Array(imageBuffer);

        return imageData;
    } catch (error) {
        throw new Error(`Failed to retrieve image from source url ${url}`);
    }
}
