import { Class_ } from "../Class_";

export class Set extends Class_ {
    public contents: string[];
    constructor(type: Class_ | string, contents: string[] = [], documentation?: string) {
        const typeName = type instanceof Class_ ? type.name : type;
        super(
            `Set<${typeName}>`,
            [],
            [],
            [],
            [],
            [],
            undefined,
            documentation
        );
    }

    public writeInvokation(): string {
        return `Set[${this.contents.join(", ")}]`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}