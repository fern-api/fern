import { Writer } from "./core/Writer";
import { Reference } from "./Reference";

export declare namespace StarImport {
    interface Args extends Pick<Reference.Args, "modulePath"> {}
}

export class StarImport extends Reference {
    public readonly docs: string | undefined;

    public constructor({ modulePath }: StarImport.Args) {
        super({ name: "*", modulePath });
    }

    public write(writer: Writer): void {
        throw new Error("Not intended to be written outside the context of a PythonFile.");
    }
}
