import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export class ClassReference extends AstNode {
    constructor(private readonly name: string, private readonly modulePath: string[]) {
        super();
    }

    public static create(name: string, modulePath: string[]): ClassReference {
        return new ClassReference(name, modulePath);
    }

    public write(writer: Writer): void {
        writer.write(this.name);
    }

    public getName(): string {
        return this.name;
    }

    public getFullQualifiedModulePath(): string {
        return this.modulePath.join(".");
    }

    public getFullyQualifiedName(): string {
        return [this.getFullQualifiedModulePath(), this.name].join(".");
    }
}
