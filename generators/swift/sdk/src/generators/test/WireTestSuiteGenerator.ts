import { assertDefined } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { DynamicSnippetsGenerator, EndpointSnippetGenerator } from "@fern-api/swift-dynamic-snippets";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { WireTestFunctionGenerator } from "./WireTestFunctionGenerator.js";

export declare namespace WireTestSuiteGenerator {
    interface Args {
        symbol: swift.Symbol;
        subclientName: string;
        packageOrSubpackage: FernIr.Package | FernIr.Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class WireTestSuiteGenerator {
    private readonly symbol: swift.Symbol;
    private readonly subclientName: string;
    private readonly packageOrSubpackage: FernIr.Package | FernIr.Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;

    public constructor({
        symbol,
        subclientName,
        packageOrSubpackage,
        sdkGeneratorContext
    }: WireTestSuiteGenerator.Args) {
        this.symbol = symbol;
        this.subclientName = subclientName;
        this.packageOrSubpackage = packageOrSubpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.dynamicIr = this.getDynamicIrOrThrow();
    }

    private get service() {
        return this.packageOrSubpackage.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.packageOrSubpackage.service)
            : undefined;
    }

    private getDynamicIrOrThrow() {
        assertDefined(this.sdkGeneratorContext.ir.dynamic, "Dynamic IR is required to generate wire tests.");
        return this.sdkGeneratorContext.ir.dynamic;
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
            name: this.symbol.name,
            properties: [],
            methods: this.generateTestFunctions()
        });
    }

    private generateTestFunctions(): swift.Method[] {
        return (this.service?.endpoints ?? []).flatMap((endpoint) => {
            const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
                ir: this.dynamicIr,
                config: this.sdkGeneratorContext.config
            });
            const endpointSnippetGenerator = new EndpointSnippetGenerator({
                context: dynamicSnippetsGenerator.context
            });
            return new WireTestFunctionGenerator({
                parentSymbol: this.symbol,
                endpoint,
                endpointSnippetGenerator,
                dynamicIr: this.dynamicIr,
                sdkGeneratorContext: this.sdkGeneratorContext
            }).generateTestFunctionsForEndpoint();
        });
    }
}
