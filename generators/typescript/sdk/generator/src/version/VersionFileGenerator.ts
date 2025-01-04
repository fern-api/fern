import { Directory } from "ts-morph";

import { Writer, ts } from "@fern-api/typescript-ast";

export declare namespace VersionFileGenerator {
    interface Args {
        rootDirectory: Directory;
        version: string;
    }
}

export class VersionFileGenerator {
    private rootDirectory: Directory;
    private version: string;

    constructor({ rootDirectory, version }: VersionFileGenerator.Args) {
        this.rootDirectory = rootDirectory;
        this.version = version;
    }

    public generate(): void {
        const writer = new Writer();
        writer.writeNodeStatement(
            ts.variable({
                const: true,
                export: true,
                initializer: ts.codeblock(`"${this.version}"`),
                name: "SDK_VERSION"
            })
        );
        this.rootDirectory.createSourceFile("src/version.ts", writer.toString());
    }
}
