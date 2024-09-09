import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { Directory } from "ts-morph";
import { Writer, ts } from "@fern-api/typescript-codegen";

export declare namespace VersionFileGenerator {
    interface Args {
        ir: IntermediateRepresentation;
        rootDirectory: Directory;
    }
}

export class VersionFileGenerator {
    private ir: IntermediateRepresentation;
    private rootDirectory: Directory;

    constructor({ ir, rootDirectory }: VersionFileGenerator.Args) {
        this.ir = ir;
        this.rootDirectory = rootDirectory;
    }

    public generate(): void {
        const writer = new Writer();
        writer.writeNodeStatement(
            ts.variable({
                const: true,
                export: true,
                initializer: ts.codeblock(`"${this.ir.sdkConfig.platformHeaders.sdkVersion}"`),
                name: "SdkVersion"
            })
        );
        this.rootDirectory.createSourceFile("version.ts", writer.toString());
    }
}
