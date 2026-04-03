import { AbstractFormatter } from "@fern-api/base-generator";
import { findDotnetToolPath } from "@fern-api/csharp-base";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import execa from "execa";

const DELIMITER = "\u0003";

interface PendingCallback {
    resolve: (result: string) => void;
    reject: (error: Error) => void;
}

/**
 * CSharpier formatter that maintains a pool of persistent `csharpier pipe-files`
 * processes. Files are distributed across the pool via round-robin, enabling
 * parallel formatting while each individual process handles files sequentially.
 */
export class CsharpFormatter extends AbstractFormatter {
    private readonly csharpierPath: string;
    private readonly poolSize: number;
    private readonly processes: (ChildProcessWithoutNullStreams | undefined)[];
    private readonly callbackQueues: PendingCallback[][];
    private readonly buffers: string[];
    private readonly processDeadFlags: boolean[];
    private fileCounter = 0;
    private nextIndex = 0;

    constructor(poolSize: number = 4) {
        super();
        this.csharpierPath = findDotnetToolPath("csharpier");
        this.poolSize = poolSize;
        this.processes = new Array<ChildProcessWithoutNullStreams | undefined>(poolSize).fill(undefined);
        this.callbackQueues = Array.from({ length: poolSize }, () => [] as PendingCallback[]);
        this.buffers = new Array<string>(poolSize).fill("");
        this.processDeadFlags = new Array<boolean>(poolSize).fill(false);
    }

    private ensureProcess(index: number): ChildProcessWithoutNullStreams {
        const existing = this.processes[index];
        if (existing != null && !existing.killed) {
            return existing;
        }

        const csharpierProcess = spawn(this.csharpierPath, ["pipe-files"], {
            stdio: "pipe",
            env: { ...process.env, DOTNET_NOLOGO: "1" }
        });

        csharpierProcess.on("error", (error: Error) => {
            process.stderr.write(`CSharpier process ${index} failed to start: ${error.message}\n`);
            this.processDeadFlags[index] = true;
            this.drainCallbacks(index);
        });

        csharpierProcess.on("close", (code: number | null) => {
            if (code != null && code !== 0) {
                process.stderr.write(`CSharpier process ${index} exited unexpectedly with code ${code}\n`);
            }
            this.processes[index] = undefined;
            this.buffers[index] = "";
            this.drainCallbacks(index);
        });

        csharpierProcess.stdin.on("error", () => {
            // EPIPE errors are expected if the process exits while we're writing
        });

        csharpierProcess.stderr.on("data", () => {
            // stderr output is ignored; CSharpier may emit warnings
        });

        csharpierProcess.stdout.on("data", (chunk: Buffer) => {
            this.buffers[index] += chunk.toString();
            const queue = this.callbackQueues[index];
            let buf = this.buffers[index] ?? "";
            let delimiterIndex = buf.indexOf(DELIMITER);
            while (delimiterIndex >= 0) {
                const result = buf.substring(0, delimiterIndex);
                buf = buf.substring(delimiterIndex + 1);
                const callback = queue?.shift();
                if (callback) {
                    callback.resolve(result);
                }
                delimiterIndex = buf.indexOf(DELIMITER);
            }
            this.buffers[index] = buf;
        });

        this.processes[index] = csharpierProcess;
        return csharpierProcess;
    }

    private appendSemicolon(content: string): string {
        return content.endsWith(";") ? content : `${content};`;
    }

    private drainCallbacks(index: number): void {
        const error = new Error(`CSharpier process ${index} exited unexpectedly`);
        const queue = this.callbackQueues[index];
        if (queue == null) {
            return;
        }
        while (queue.length > 0) {
            const callback = queue.shift();
            if (callback) {
                callback.reject(error);
            }
        }
    }

    private pipeFile(content: string): Promise<string> {
        const index = this.nextIndex % this.poolSize;
        this.nextIndex++;

        if (this.processDeadFlags[index]) {
            return Promise.reject(new Error(`CSharpier process ${index} is not available`));
        }

        const proc = this.ensureProcess(index);
        const filePath = `Dummy${this.fileCounter++}.cs`;
        proc.stdin.write(filePath);
        proc.stdin.write(DELIMITER);
        proc.stdin.write(content);
        proc.stdin.write(DELIMITER);

        return new Promise<string>((resolve, reject) => {
            this.callbackQueues[index]?.push({ resolve, reject });
        });
    }

    public async format(content: string): Promise<string> {
        return this.pipeFile(this.appendSemicolon(content));
    }

    public override async formatMultiple(contents: string[]): Promise<string[]> {
        return Promise.all(contents.map((c) => this.pipeFile(this.appendSemicolon(c))));
    }

    public formatSync(content: string): string {
        content = this.appendSemicolon(content);

        const { stdout } = execa.sync(
            this.csharpierPath,
            ["format", "--no-msbuild-check", "--skip-validation", "--compilation-errors-as-warnings"],
            {
                input: content,
                encoding: "utf-8",
                stripFinalNewline: false
            }
        );
        return stdout;
    }

    public dispose(): void {
        for (let i = 0; i < this.poolSize; i++) {
            const proc = this.processes[i];
            if (proc != null && !proc.killed) {
                proc.stdin.end();
                proc.kill();
                this.processes[i] = undefined;
            }
        }
    }
}
