import execa from "execa";

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

        const { stdout } = await execa(this.csharpier, ["--fast", "--no-msbuild-check"], {
            input: content,
            encoding: "utf-8",
            stripFinalNewline: false
        });
        return stdout;
    }

    public override async formatMultiple(contents: string[]): Promise<string[]> {
        const content = contents
            .map((c) => {
                if (!c.endsWith(";")) {
                    c += ";";
                }
                return c;
            })
            .map((c, index) => `Dummy${index}.cs\u0003${c}\u0003`)
            .join();
        const { stdout } = await execa(this.csharpier, ["--fast", "--no-msbuild-check", "--pipe-multiple-files"], {
            input: content,
            encoding: "utf-8",
            stripFinalNewline: false
        });
        return stdout.split("\u0003");
    }

    public formatSync(content: string): string {
        if (!content.endsWith(";")) {
            content += ";";
        }
        const { stdout } = execa.sync(this.csharpier, ["--fast", "--no-msbuild-check"], {
            input: content,
            encoding: "utf-8",
            stripFinalNewline: false
        });
        return stdout;
    }
}
