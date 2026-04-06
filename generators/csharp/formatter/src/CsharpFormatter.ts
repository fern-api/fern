import { AbstractFormatter } from "@fern-api/base-generator";
import { findDotnetToolPath } from "@fern-api/csharp-base";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import execa from "execa";

const DELIMITER = "\u0003";

export class CsharpFormatter extends AbstractFormatter {
    private readonly csharpierPath: string;
    private process: ChildProcessWithoutNullStreams | undefined;
    private callbacks: { resolve: (result: string) => void; reject: (error: Error) => void }[] = [];
    private buffer: string = "";
    private processDead = false;
    private fileCounter = 0;

    constructor() {
        super();
        this.csharpierPath = findDotnetToolPath("csharpier");
    }

    private ensureProcess(): ChildProcessWithoutNullStreams {
        if (this.process != null && !this.process.killed) {
            return this.process;
        }

        const csharpierProcess = spawn(this.csharpierPath, ["pipe-files"], {
            stdio: "pipe",
            env: { ...process.env, DOTNET_NOLOGO: "1" }
        });

        csharpierProcess.on("error", (error: Error) => {
            process.stderr.write(`CSharpier process failed to start: ${error.message}\n`);
            this.processDead = true;
            this.drainCallbacks();
        });

        csharpierProcess.on("close", (code: number | null) => {
            if (code != null && code !== 0) {
                process.stderr.write(`CSharpier process exited unexpectedly with code ${code}\n`);
            }
            this.process = undefined;
            this.buffer = "";
            this.drainCallbacks();
        });

        csharpierProcess.stdin.on("error", () => {
            // EPIPE errors are expected if the process exits while we're writing
        });

        csharpierProcess.stderr.on("data", () => {
            // stderr output is ignored; CSharpier may emit warnings
        });

        csharpierProcess.stdout.on("data", (chunk: Buffer) => {
            this.buffer += chunk.toString();
            let delimiterIndex = this.buffer.indexOf(DELIMITER);
            while (delimiterIndex >= 0) {
                const result = this.buffer.substring(0, delimiterIndex);
                this.buffer = this.buffer.substring(delimiterIndex + 1);
                const callback = this.callbacks.shift();
                if (callback) {
                    callback.resolve(result);
                }
                delimiterIndex = this.buffer.indexOf(DELIMITER);
            }
        });

        this.process = csharpierProcess;
        return csharpierProcess;
    }

    private appendSemicolon(content: string): string {
        return content.endsWith(";") ? content : `${content};`;
    }

    private drainCallbacks(): void {
        const error = new Error("CSharpier process exited unexpectedly");
        while (this.callbacks.length > 0) {
            const callback = this.callbacks.shift();
            if (callback) {
                callback.reject(error);
            }
        }
    }

    private pipeFile(content: string): Promise<string> {
        if (this.processDead) {
            return Promise.reject(new Error("CSharpier process is not available"));
        }

        const proc = this.ensureProcess();
        const filePath = `Dummy${this.fileCounter++}.cs`;
        proc.stdin.write(filePath);
        proc.stdin.write(DELIMITER);
        proc.stdin.write(content);
        proc.stdin.write(DELIMITER);

        return new Promise<string>((resolve, reject) => {
            this.callbacks.push({ resolve, reject });
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
        if (this.process != null && !this.process.killed) {
            this.process.stdin.end();
            this.process.kill();
            this.process = undefined;
        }
    }
}
