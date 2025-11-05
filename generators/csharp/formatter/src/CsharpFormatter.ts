import { AbstractFormatter } from "@fern-api/base-generator";
import { findDotnetToolPath } from "@fern-api/csharp-base";
import execa from "execa";

export class CsharpFormatter extends AbstractFormatter {
    private readonly csharpier: string;

    constructor() {
        super();
        this.csharpier = findDotnetToolPath("csharpier");
    }

    private appendSemicolon(content: string): string {
        return content.endsWith(";") ? content : `${content};`;
    }

    public async format(content: string): Promise<string> {
        content = this.appendSemicolon(content);

        const { stdout } = await execa(
            this.csharpier,
            ["format", "--no-msbuild-check", "--skip-validation", "--compilation-errors-as-warnings"],
            {
                input: content,
                encoding: "utf-8",
                stripFinalNewline: false
            }
        );
        return stdout;
    }

    public override async formatMultiple(contents: string[]): Promise<string[]> {
        const content = contents.map((c, index) => `Dummy${index}.cs\u0003${this.appendSemicolon(c)}\u0003`).join();

        const { stdout } = await execa(this.csharpier, ["pipe-files"], {
            input: content,
            encoding: "utf-8",
            stripFinalNewline: false
        });
        return stdout.split("\u0003");
    }

    public formatSync(content: string): string {
        content = this.appendSemicolon(content);

        const { stdout } = execa.sync(
            this.csharpier,
            ["format", "--no-msbuild-check", "--skip-validation", "--compilation-errors-as-warnings"],
            {
                input: content,
                encoding: "utf-8",
                stripFinalNewline: false
            }
        );
        return stdout;
    }
}
