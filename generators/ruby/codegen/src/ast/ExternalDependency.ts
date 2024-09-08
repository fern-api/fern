import { ExtraDependenciesSchema } from "../BaseGeneratorConfig";
import { AstNode } from "./core/AstNode";

interface Version {
    version: string;
    specifier: string;
}
export declare namespace ExternalDependency {
    export interface Init extends AstNode.Init {
        lowerBound?: Version;
        upperBound?: Version;
        packageName: string;
    }
}
export class ExternalDependency extends AstNode {
    public lowerBound: Version | undefined;
    public upperBound: Version | undefined;
    public packageName: string;

    constructor({ lowerBound, upperBound, packageName, ...rest }: ExternalDependency.Init) {
        super(rest);
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.packageName = packageName;
    }

    public static convertDependencies(dependency: ExtraDependenciesSchema): ExternalDependency[] {
        const dependencies = [];
        for (const [key, value] of Object.entries(dependency)) {
            if (typeof value === "string") {
                dependencies.push(
                    new ExternalDependency({
                        packageName: key,
                        lowerBound: {
                            version: value,
                            specifier: "~>"
                        }
                    })
                );
            } else {
                dependencies.push(
                    new ExternalDependency({
                        packageName: key,
                        lowerBound:
                            value.lowerBound != null
                                ? {
                                      version: value.lowerBound.version,
                                      specifier: value.lowerBound.specifier ?? ">="
                                  }
                                : undefined,
                        upperBound:
                            value.upperBound != null
                                ? {
                                      version: value.upperBound.version,
                                      specifier: value.upperBound.specifier ?? "<="
                                  }
                                : undefined
                    })
                );
            }
        }
        return dependencies;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: `"${this.packageName}"`,
            startingTabSpaces
        });
        this.addText({
            stringContent: this.lowerBound?.specifier,
            templateString: ', "%s',
            appendToLastString: true
        });
        this.addText({
            stringContent: this.lowerBound?.version,
            templateString: ' %s"',
            appendToLastString: true
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
