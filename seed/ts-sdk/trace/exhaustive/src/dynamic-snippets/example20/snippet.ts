import { SeedTraceClient, SeedTrace } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.problem.getDefaultStarterFiles({
        inputParams: [
            {
                variableType: SeedTrace.commons.VariableType.integerType({}),
                name: "name",
            },
            {
                variableType: SeedTrace.commons.VariableType.integerType({}),
                name: "name",
            },
        ],
        outputType: SeedTrace.commons.VariableType.integerType({}),
        methodName: "methodName",
    });
}
main();
