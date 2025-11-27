import { AbstractFormatter } from "@fern-api/base-generator";
import { findDotnetToolPath } from "@fern-api/csharp-base";
import { ChildProcess, spawn } from "child_process";
import execa from "execa";

const ETX = "\u0003";

interface PendingRequest {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
}

/**
 * CsharpFormatter uses a persistent csharpier process to format C# code.
 * This avoids the overhead of starting a new process for each formatting request.
 * The process is kept alive using the pipe-files subcommand.
 */
export class CsharpFormatter extends AbstractFormatter {
    private readonly csharpierPath: string;
    private process: ChildProcess | null = null;
    private buffer: string = "";
    private stderrBuffer: string = "";
    private pendingRequests: PendingRequest[] = [];
    private isProcessReady: boolean = false;
    private processError: Error | null = null;

    constructor() {
        super();
        this.csharpierPath = findDotnetToolPath("csharpier");
    }

    private appendSemicolon(content: string): string {
        return content.endsWith(";") ? content : `${content};`;
    }

    private ensureProcess(): void {
        if (this.process != null && !this.process.killed) {
            return;
        }

        this.buffer = "";
        this.stderrBuffer = "";
        this.processError = null;
        this.isProcessReady = true;

        // Use pipe-files subcommand which keeps the process alive and accepts multiple files
        // Protocol: send "filename\u0003content\u0003", receive "formatted_content\u0003"
        this.process = spawn(this.csharpierPath, ["pipe-files"], {
            stdio: ["pipe", "pipe", "pipe"]
        });

        this.process.stdout?.setEncoding("utf-8");
        this.process.stderr?.setEncoding("utf-8");

        this.process.stdout?.on("data", (data: string) => {
            this.buffer += data;
            this.processBuffer();
        });

        this.process.stderr?.on("data", (data: string) => {
            // Capture stderr for error reporting
            this.stderrBuffer += data;
        });

        this.process.on("error", (error: Error) => {
            this.processError = error;
            this.isProcessReady = false;
            this.rejectAllPending(error);
        });

        this.process.on("close", (code: number | null) => {
            this.isProcessReady = false;
            if (code !== 0 && code !== null) {
                const stderrMsg = this.stderrBuffer.trim();
                const error = new Error(
                    `csharpier process exited with code ${code}${stderrMsg ? `: ${stderrMsg}` : ""}`
                );
                this.processError = error;
                this.rejectAllPending(error);
            }
            this.process = null;
        });
    }

    private processBuffer(): void {
        // The output format is: formatted_content\u0003
        // Each formatted file ends with ETX
        while (this.buffer.includes(ETX)) {
            const etxIndex = this.buffer.indexOf(ETX);
            const formattedContent = this.buffer.slice(0, etxIndex);
            this.buffer = this.buffer.slice(etxIndex + 1);

            const pendingRequest = this.pendingRequests.shift();
            if (pendingRequest != null) {
                pendingRequest.resolve(formattedContent);
            }
        }
    }

    private rejectAllPending(error: Error): void {
        for (const request of this.pendingRequests) {
            request.reject(error);
        }
        this.pendingRequests = [];
    }

    public async format(content: string): Promise<string> {
        content = this.appendSemicolon(content);

        this.ensureProcess();

        if (this.processError != null) {
            throw this.processError;
        }

        if (this.process?.stdin == null) {
            throw new Error("csharpier process stdin is not available");
        }

        return new Promise<string>((resolve, reject) => {
            this.pendingRequests.push({ resolve, reject });

            // Format: filename\u0003content\u0003
            const input = `Dummy.cs${ETX}${content}${ETX}`;
            this.process?.stdin?.write(input);
        });
    }

    public override async formatMultiple(contents: string[]): Promise<string[]> {
        // Format all contents in parallel using the persistent process
        return Promise.all(contents.map((content) => this.format(content)));
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

    /**
     * Cleanup the persistent csharpier process.
     * Call this when the formatter is no longer needed.
     */
    public cleanup(): void {
        if (this.process != null && !this.process.killed) {
            this.process.stdin?.end();
            this.process.kill();
            this.process = null;
        }
        this.isProcessReady = false;
        this.buffer = "";
        this.stderrBuffer = "";
        this.pendingRequests = [];
    }
}
