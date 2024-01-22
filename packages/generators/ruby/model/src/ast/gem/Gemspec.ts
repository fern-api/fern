// Note a gemspec for us is just a Ruby class and we configure

import { ExternalDependency } from "../ExternalDependency";
import { Import } from "../Import";
import { ClassReference } from "../classes/ClassReference";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";

export declare namespace Gemspec {
    export interface Init {
        clientName: string;
        gemName: string;
        dependencies: ExternalDependency[];
    }
}
export class Gemspec extends FunctionInvocation {
    constructor({ clientName, gemName, dependencies }: Gemspec.Init) {
        const globalDependencies: ExternalDependency[] = [];

        super({
            baseFunction: new Function_({ name: "new", functionBody: [] }),
            onObject: "Gem::Specification",
            block: {
                arguments: "spec",
                expressions: [
                    new Expression({
                        leftSide: "spec.name",
                        rightSide: new ClassReference({
                            name: `"${gemName}"`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "spec.version",
                        rightSide: new ClassReference({
                            name: `${clientName}::Gemconfig::VERSION`,
                            import_: new Import({ from: "lib/gemconfig" })
                        }),
                        isAssignment: true
                    }),
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
                        rightSide: '">= 2.6.0"',
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
                    new Expression({
                        leftSide: "spec.files",
                        rightSide: 'Dir.glob("lib/**/*") << "LICENSE.md"',
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
