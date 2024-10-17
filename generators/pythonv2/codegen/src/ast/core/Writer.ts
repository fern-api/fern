import { AbstractWriter } from "@fern-api/generator-commons";
import { Reference } from "../Reference";

/* A dot-separated string representing the module path */
type ModulePath = string;

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Reference[] = [];

    public toString(): string {
        return this.buffer;
    }

    public addReference(reference: Reference): void {
        this.references.push(reference);
    }

    public getReferences(): Reference[] {
        return this.references;
    }
}
