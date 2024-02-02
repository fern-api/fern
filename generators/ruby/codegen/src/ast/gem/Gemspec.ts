// Note a gemspec for us is just a Ruby class and we configure

import { ClassReference } from "../classes/ClassReference";
import { Expression } from "../expressions/Expression";
import { ExternalDependency } from "../ExternalDependency";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";

export declare namespace Gemspec {
    export interface Init {
        clientName: string;
        gemName: string;
        dependencies: ExternalDependency[];
        sdkVersion: string | undefined;
        hasFileBasedDependencies?: boolean;
    }
}
export class Gemspec extends FunctionInvocation {
    constructor({ clientName, gemName, dependencies, sdkVersion, hasFileBasedDependencies = false }: Gemspec.Init) {
        const globalDependencies: ExternalDependency[] = [
            new ExternalDependency({ packageName: "faraday", specifier: "~>", version: "2.7" }),
            new ExternalDependency({ packageName: "faraday-retry", specifier: "~>", version: "2.2" }),
            new ExternalDependency({ packageName: "async-http-faraday", specifier: "~>", version: "0.12" })
        ];
        if (hasFileBasedDependencies) {
            globalDependencies.push(
                ...[
                    new ExternalDependency({ packageName: "mini_mime", specifier: "~>", version: "1.1" }),
                    new ExternalDependency({ packageName: "faraday-multipart", specifier: "~>", version: "1.0" })
                ]
            );
        }

        const gemBlock = [
            new Expression({
                leftSide: "spec.name",
                rightSide: new ClassReference({
                    name: `"${gemName}"`,
                    import_: new Import({ from: "lib/gemconfig" })
                }),
                isAssignment: true
            })
        ];
        if (sdkVersion !== undefined) {
            gemBlock.push(
                new Expression({
                    leftSide: "spec.version",
                    rightSide: new ClassReference({
                        name: `"${sdkVersion}"`,
                        import_: new Import({ from: "lib/gemconfig" })
                    }),
                    isAssignment: true
                })
            );
        } else {
            // Allow for people to use the gemconfig if no version is found
            gemBlock.push(
                new Expression({
                    leftSide: "spec.version",
                    rightSide: new ClassReference({
                        name: `${clientName}::Gemconfig::VERSION`,
                        import_: new Import({ from: "lib/gemconfig" })
                    }),
                    isAssignment: true
                })
            );
        }

        super({
            baseFunction: new Function_({ name: "new", functionBody: [] }),
            onObject: "Gem::Specification",
            block: {
                arguments: "spec",
                expressions: [
                    ...gemBlock,
                    new Expression({
                        leftSide: "spec.authors",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::AUTHORS`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.email",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::EMAIL`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.summary",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::SUMMARY`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.description",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::DESCRIPTION`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.homepage",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::HOMEPAGE`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.required_ruby_version",
                        rightSide: '">= 2.7.0"',
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: 'spec.metadata["homepage_uri"]',
                        rightSide: "spec.homepage",
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: 'spec.metadata["source_code_uri"]',
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::SOURCE_CODE_URI`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: 'spec.metadata["changelog_uri"]',
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::CHANGELOG_URI`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    // TODO: add  `<< "LICENSE.md"` if a license file is added through config
                    new Expression({
                        leftSide: "spec.files",
                        rightSide: 'Dir.glob("lib/**/*")',
                        isAssignment: true
                    }),
                    new Expression({ leftSide: "spec.bindir", rightSide: '"exe"', isAssignment: true }),
                    new Expression({
                        leftSide: "spec.executables",
                        rightSide: "spec.files.grep(%r{\\Aexe/}) { |f| File.basename(f) }",
                        isAssignment: true
                    }),
                    new Expression({ leftSide: "spec.require_paths", rightSide: '["lib"]', isAssignment: true }),
                    ...dependencies.concat(globalDependencies)
                ]
            },
            writeImports: true
        });
    }
}
