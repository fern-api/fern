import { ts, Writer } from "@fern-api/typescript-ast";
import { Directory } from "ts-morph";

export declare namespace VersionFileGenerator {
    interface Args {
        packagePathDirectory: Directory;
        version: string;
    }
}

export class VersionFileGenerator {
    private packagePathDirectory: Directory;
    private version: string;

    constructor({ packagePathDirectory, version }: VersionFileGenerator.Args) {
        this.packagePathDirectory = packagePathDirectory;
        this.version = version;
    }

    public generate(): void {
        const writer = new Writer({ customConfig: {} });
        writer.writeNodeStatement(
            ts.variable({
                const: true,
                export: true,
                initializer: ts.codeblock(`"${this.version}"`),
                name: "SDK_VERSION"
            })
        );
        this.packagePathDirectory.createSourceFile("version.ts", writer.toString());
    }
}
