import { AstNode } from "./core/AstNode";

interface Version {
    version: string;
    specifier: string;
}
export declare namespace ExternalDependency {
    export interface Init extends AstNode.Init {
        lowerBound: Version;
        upperBound?: Version;
        packageName: string;
    }
}
export class ExternalDependency extends AstNode {
    public lowerBound: Version;
    public upperBound: Version | undefined;
    public packageName: string;

    constructor({ lowerBound, upperBound, packageName, ...rest }: ExternalDependency.Init) {
        super(rest);
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.packageName = packageName;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: `spec.add_dependency "${this.packageName}", "${this.lowerBound.specifier} ${this.lowerBound.version}"`,
            startingTabSpaces
        });
        this.addText({
            stringContent: this.upperBound?.specifier,
            templateString: ', "%s',
            appendToLastString: true
        });
        this.addText({
            stringContent: this.upperBound?.version,
            templateString: ' %s"',
            appendToLastString: true
        });
    }
}
