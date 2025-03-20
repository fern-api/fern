import { ChildProcessWithoutNullStreams, execSync, spawn } from "child_process";

import { AbstractFormatter } from "@fern-api/base-generator";

import { findDotnetToolPath } from "./findDotNetToolPath";

export class CsharpFormatter extends AbstractFormatter {
    private readonly csharpier: string;

    constructor() {
        super();
        this.csharpier = findDotnetToolPath("dotnet-csharpier");
    }

    public async format(content: string): Promise<string> {
        if (!content.endsWith(";")) {
            content += ";";
        }

        const childProcess = spawn(this.csharpier, ["--fast", "--no-msbuild-check", "--pipe-multiple-files"], {
            stdio: "pipe"
        });
        let stdout = "";
        let stderr = "";

        return new Promise<string>((resolve, reject) => {
            // csharpier allows multiple files, so it expects you to send the filename first, then the file contents
            childProcess.stdin.write("dummy.cs");
            childProcess.stdin.write("\u0003");
            childProcess.stdin.write(content);
            if (!content.endsWith("\u0003")) {
                childProcess.stdin.write("\u0003");
            }
            childProcess.stdin.end();

            childProcess.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            childProcess.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            childProcess.on("close", (code) => {
                if (code === 0) {
                    if (stdout.endsWith("\u0003")) {
                        stdout = stdout.slice(0, -1);
                    }
                    resolve(stdout);
                } else {
                    reject(new Error(`Formatting failed with code ${code}: ${stderr}`));
                }
            });

            childProcess.on("error", (error) => {
                reject(error);
            });
        });
    }

    public formatSync(content: string): string {
        if (!content.endsWith(";")) {
            content += ";";
        }
        try {
            return execSync([this.csharpier, "--fast", "--no-msbuild-check"].join(" "), {
                input: content,
                encoding: "utf-8"
            });
        } catch (e: unknown) {
            return content;
        }
    }
}
