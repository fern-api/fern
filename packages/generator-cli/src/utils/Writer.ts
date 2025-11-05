import fs from "fs";

export abstract class Writer {
    public async writeCodeBlock(language: string, content: string): Promise<void> {
        await this.writeLine(`\`\`\`${language}`);
        await this.write(content);
        await this.writeLine("```");
    }

    public async writeLine(content?: string): Promise<void> {
        if (content === undefined) {
            await this.write("\n");
        } else {
            await this.write(`${content}\n`);
        }
    }

    public abstract write(content: string): Promise<void>;
    public abstract end(): Promise<void>;
}

export class StreamWriter extends Writer {
    constructor(private stream: fs.WriteStream | NodeJS.Process["stdout"]) {
        super();
        this.stream = stream;
    }

    public async write(content: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const handleError = (err: Error) => {
                this.stream.removeListener("error", handleError);
                reject(err);
            };
            if (this.stream instanceof fs.WriteStream) {
                const canWrite = this.stream.write(content, (error: Error | null | undefined) => {
                    this.stream.removeListener("error", handleError);
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
                this.stream.once("error", handleError);
                if (!canWrite) {
                    this.stream.once("drain", resolve);
                }
            } else {
                // stdout (process.stdout)
                const canWrite = this.stream.write(content);
                this.stream.once("error", handleError);
                if (!canWrite) {
                    this.stream.once("drain", () => {
                        this.stream.removeListener("error", handleError);
                        resolve();
                    });
                } else {
                    this.stream.removeListener("error", handleError);
                    resolve();
                }
            }
        });
    }

    public end(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.stream instanceof fs.WriteStream) {
                this.stream.end(() => {
                    resolve();
                });
                this.stream.once("error", reject);
                this.stream.once("finish", resolve);
            } else {
                // Force flush any remaining data
                this.stream.write("", () => {
                    resolve();
                });
            }
        });
    }
}

export class StringWriter extends Writer {
    private content: string;

    constructor() {
        super();
        this.content = "";
    }

    public async write(content: string): Promise<void> {
        this.content += content;
    }

    public async end(): Promise<void> {
        return;
    }

    public toString(): string {
        return this.content;
    }
}
