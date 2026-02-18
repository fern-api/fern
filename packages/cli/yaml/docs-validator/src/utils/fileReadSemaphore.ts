import { readFile } from "fs/promises";

const MAX_CONCURRENT_FILE_READS = parseInt(process.env.FERN_DOCS_MAX_CONCURRENT_FILE_READS ?? "20", 10);

class Semaphore {
    private running = 0;
    private queue: Array<() => void> = [];

    constructor(private readonly limit: number) {}

    async acquire(): Promise<void> {
        if (this.running < this.limit) {
            this.running++;
            return;
        }
        return new Promise<void>((resolve) => {
            this.queue.push(() => {
                this.running++;
                resolve();
            });
        });
    }

    release(): void {
        this.running--;
        const next = this.queue.shift();
        if (next != null) {
            next();
        }
    }
}

const globalFileReadSemaphore = new Semaphore(MAX_CONCURRENT_FILE_READS);

export async function boundedReadFile(filepath: string, encoding: BufferEncoding): Promise<string> {
    await globalFileReadSemaphore.acquire();
    try {
        return await readFile(filepath, encoding);
    } finally {
        globalFileReadSemaphore.release();
    }
}
