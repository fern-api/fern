import { Class_ } from "../Class_";

export class Array extends Class_ {
    public contents: string[];
    constructor(type: Class_ | string, contents: string[] = [], documentation?: string) {
        const typeName = type instanceof Class_ ? type.name : type;
        super(
            `Array<${typeName}>`,
            [],
            [],
            [],
            [],
            [],
            undefined,
            documentation
        );

        this.contents = contents;
    }

    public writeInvokation(): string {
        return `[${this.contents.join(", ")}]`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}