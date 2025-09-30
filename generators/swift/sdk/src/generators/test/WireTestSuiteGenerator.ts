import { swift } from "@fern-api/swift-codegen";
import { Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace WireTestSuiteGenerator {
    interface Args {
        suiteName: string;
        subclientName: string;
        subpackage: Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class WireTestSuiteGenerator {
    private readonly suiteName: string;
    private readonly subclientName: string;
    private readonly subpackage: Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ suiteName, subclientName, subpackage, sdkGeneratorContext }: WireTestSuiteGenerator.Args) {
        this.suiteName = suiteName;
        this.subclientName = subclientName;
        this.subpackage = subpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    private get service() {
        return this.subpackage.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.subpackage.service)
            : undefined;
    }

    public generate(): swift.Struct {
        return swift.struct({
            attributes: [
                {
                    name: "Suite",
                    arguments: [
                        swift.functionArgument({
                            value: swift.Expression.stringLiteral(`${this.subclientName} Wire Tests`)
                        })
                    ]
                }
            ],
            name: this.suiteName,
            properties: [],
            methods: this.generateTestFunctions()
        });
    }

    private generateTestFunctions(): swift.Method[] {
        return (this.service?.endpoints ?? []).map((endpoint) => {
            // TODO(kafkas): Implement this
            const statements: swift.Statement[] = [
                swift.Statement.constantDeclaration({
                    unsafeName: "expected",
                    value: swift.Expression.stringLiteral("abc")
                }),
                swift.Statement.constantDeclaration({
                    unsafeName: "actual",
                    value: swift.Expression.stringLiteral("abc")
                }),
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.functionCall({
                            unsafeName: "#require",
                            arguments_: [
                                swift.functionArgument({
                                    value: swift.Expression.equals(
                                        swift.Expression.reference("expected"),
                                        swift.Expression.reference("actual")
                                    )
                                })
                            ]
                        })
                    )
                )
            ];
            return swift.method({
                unsafeName: endpoint.name.camelCase.unsafeName,
                async: true,
                throws: true,
                returnType: swift.Type.void(),
                body: swift.CodeBlock.withStatements(statements)
            });
        });
    }
}
