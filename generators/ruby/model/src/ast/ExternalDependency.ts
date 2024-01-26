import { AstNode } from "./core/AstNode";

export declare namespace ExternalDependency {
    export interface Init extends AstNode.Init {
        version: string;
        specifier: string;
        packageName: string;
    }
}
export class ExternalDependency extends AstNode {
    public version: string;
    public specifier: string;
    public packageName: string;

    constructor({ version, specifier, packageName, ...rest }: ExternalDependency.Init) {
        super(rest);
        this.version = version;
        this.specifier = specifier;
        this.packageName = packageName;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: `spec.add_dependency "${this.packageName}", "${this.specifier} ${this.version}"`,
            startingTabSpaces
        });
    }
}
