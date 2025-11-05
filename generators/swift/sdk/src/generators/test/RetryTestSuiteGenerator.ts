import { swift } from "@fern-api/swift-codegen";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace RetryTestSuiteGenerator {
    interface Args {
        symbol: swift.Symbol;
        rootClientName: string;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class RetryTestSuiteGenerator {
    private readonly symbol: swift.Symbol;
    private readonly rootClientName: string;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ symbol, rootClientName, sdkGeneratorContext }: RetryTestSuiteGenerator.Args) {
        this.symbol = symbol;
        this.rootClientName = rootClientName;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): swift.Struct {
        return swift.struct({
            attributes: [
                {
                    name: "Suite",
                    arguments: [
                        swift.functionArgument({
                            value: swift.Expression.stringLiteral(`${this.rootClientName} Retry Tests`)
                        })
                    ]
                }
            ],
            name: this.symbol.name,
            properties: [],
            methods: this.generateTestFunctions()
        });
    }

    private generateTestFunctions(): swift.Method[] {
        // TODO(kafkas): Implement
        return [];
    }
}
