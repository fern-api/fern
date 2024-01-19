// Note a gemspec for us is just a Ruby class and we configure

import { Expression } from "../expressions/Expression";
import { ExternalDependency } from "../ExternalDependency";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";

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
                    new Expression({ leftSide: "spec.name", rightSide: `${moduleName}::Gem::NAME` }),
                    new Expression({ leftSide: "spec.version", rightSide: `${moduleName}::Gem::VERSION` }),
                    new Expression({ leftSide: "spec.authors", rightSide: `${moduleName}::Gem::NAME` }),
                    new Expression({ leftSide: "spec.email", rightSide: `${moduleName}::Gem::EMAIL` }),
                    new Expression({ leftSide: "spec.summary", rightSide: `${moduleName}::Gem::SUMMARY` }),
                    new Expression({ leftSide: "spec.description", rightSide: `${moduleName}::Gem::DESCRIPTION` }),
                    new Expression({ leftSide: "spec.homepage", rightSide: `${moduleName}::Gem::HOMEPAGE` }),
                    new Expression({ leftSide: "spec.required_ruby_version", rightSide: ">= 2.6.0" }),
                    new Expression({ leftSide: 'spec.metadata["homepage_uri"]', rightSide: "spec.homepage" }),
                    new Expression({
                        leftSide: 'spec.metadata["source_code_uri"]',
                        rightSide: `${moduleName}::Gem::SOURCE_CODE_URI`
                    }),
                    new Expression({
                        leftSide: 'spec.metadata["changelog_uri"]',
                        rightSide: `${moduleName}::Gem::CHANGELOG_URI`
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
