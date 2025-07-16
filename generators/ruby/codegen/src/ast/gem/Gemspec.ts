// Note a gemspec for us is just a Ruby class and we configure
import { MINIMUM_RUBY_VERSION } from "../../utils/RubyUtilities";
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
        sdkVersion: string | undefined;
        hasFileBasedDependencies?: boolean;
        hasEndpoints?: boolean;
        license?: { licenseFilePath: string; licenseType?: string };
    }
}
export class Gemspec extends FunctionInvocation {
    constructor({
        clientName,
        gemName,
        dependencies,
        sdkVersion,
        license,
        hasFileBasedDependencies = false,
        hasEndpoints = false
    }: Gemspec.Init) {
        const globalDependencies: ExternalDependency[] = [];
        if (hasEndpoints) {
            globalDependencies.push(
                ...[
                    new ExternalDependency({
                        packageName: "faraday",
                        lowerBound: { specifier: ">=", version: "1.10" },
                        upperBound: { specifier: "<", version: "3.0" }
                    }),
                    new ExternalDependency({
                        packageName: "faraday-net_http",
                        lowerBound: { specifier: ">=", version: "1.0" },
                        upperBound: { specifier: "<", version: "4.0" }
                    }),
                    new ExternalDependency({
                        packageName: "faraday-retry",
                        lowerBound: { specifier: ">=", version: "1.0" },
                        upperBound: { specifier: "<", version: "3.0" }
                    }),
                    new ExternalDependency({
                        packageName: "async-http-faraday",
                        lowerBound: { specifier: ">=", version: "0.0" },
                        upperBound: { specifier: "<", version: "1.0" }
                    })
                ]
            );
        }
        if (hasFileBasedDependencies) {
            globalDependencies.push(
                ...[
                    new ExternalDependency({ packageName: "mini_mime" }),
                    new ExternalDependency({
                        packageName: "faraday-multipart",
                        lowerBound: { specifier: ">=", version: "0.0" },
                        upperBound: { specifier: "<", version: "2.0" }
                    })
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
        if (license !== undefined && license.licenseType !== undefined) {
            gemBlock.push(
                new Expression({
                    leftSide: "spec.licenses",
                    rightSide: `["${license.licenseType}"]`,
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
                        rightSide: `">= ${MINIMUM_RUBY_VERSION}.0"`,
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
                        rightSide: `Dir.glob("lib/**/*")${
                            license !== undefined ? ' << "' + license.licenseFilePath + '"' : ""
                        }`,
                        isAssignment: true
                    }),
                    new Expression({ leftSide: "spec.bindir", rightSide: '"exe"', isAssignment: true }),
                    new Expression({
                        leftSide: "spec.executables",
                        rightSide: "spec.files.grep(%r{\\Aexe/}) { |f| File.basename(f) }",
                        isAssignment: true
                    }),
                    new Expression({ leftSide: "spec.require_paths", rightSide: '["lib"]', isAssignment: true }),
                    ...dependencies
                        .concat(globalDependencies)
                        .map(
                            (dep) =>
                                new Expression({ leftSide: "spec.add_dependency", rightSide: dep, isAssignment: false })
                        )
                ]
            },
            writeImports: true
        });
    }
}
