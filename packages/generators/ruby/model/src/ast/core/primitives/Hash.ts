import { Class_ } from "../Class_";

export class Hash extends Class_ {
    public contents: Map<string, string>;
    public isFrozen: boolean;

    constructor(keyType: Class_ | string, valueType: Class_ | string, contents: Map<string, string> = new Map(), isFrozen = false, documentation?: string) {
        const keyTypeName = keyType instanceof Class_ ? keyType.name : keyType;
        const valueTypeName = valueType instanceof Class_ ? valueType.name : valueType;
        super(
            `Hash{${keyTypeName} => ${valueTypeName}}`,
            [],
            [],
            [],
            [],
            [],
            undefined,
            documentation
        );

        this.contents = contents;
        this.isFrozen = isFrozen;
    }

    public writeInvokation(): string {
        return `${JSON.stringify(Object.fromEntries(this.contents.entries()))}${this.isFrozen && ".frozen"}`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}