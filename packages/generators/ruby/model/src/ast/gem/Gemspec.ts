// Note a gemspec for us is just a Ruby class and we configure

import { ClassReference } from "../classes/ClassReference";
import { Expression } from "../expressions/Expression";
import { ExternalDependency } from "../ExternalDependency";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";

export declare namespace Gemspec {
    export interface Init {
        moduleName: string;
        dependencies: ExternalDependency[];
    }
}
export class Gemspec extends FunctionInvocation {
    constructor({ moduleName, dependencies }: Gemspec.Init) {
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
                            name: `${moduleName}::Gemconfig::NAME`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.version",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::VERSION`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.authors",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::AUTHORS`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.email",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::EMAIL`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.summary",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::SUMMARY`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.description",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::DESCRIPTION`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: "spec.homepage",
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::HOMEPAGE`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({ leftSide: "spec.required_ruby_version", rightSide: '">= 2.6.0"' }),
                    new Expression({ leftSide: 'spec.metadata["homepage_uri"]', rightSide: "spec.homepage" }),
                    new Expression({
                        leftSide: 'spec.metadata["source_code_uri"]',
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::SOURCE_CODE_URI`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({
                        leftSide: 'spec.metadata["changelog_uri"]',
                        rightSide: new ClassReference({
                            name: `${moduleName}::Gemconfig::CHANGELOG_URI`,
                            import_: new Import({ from: "lib/gemconfig" })
                        })
                    }),
                    new Expression({ leftSide: "spec.files", rightSide: 'Dir.glob("lib/**/*") << "LICENSE.md"' }),
                    new Expression({ leftSide: "spec.bindir", rightSide: '"exe"' }),
                    new Expression({
                        leftSide: "spec.executables",
                        rightSide: "spec.files.grep(%r{\\Aexe/}) { |f| File.basename(f) }"
                    }),
                    new Expression({ leftSide: "spec.require_paths", rightSide: '["lib"]' }),
                    ...dependencies.concat(globalDependencies)
                ]
            },
            writeImports: true
        });
    }
}
