import { SeedTraceClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.problem.getDefaultStarterFiles({
        inputParams: [
            {
                variableType: {
                    integerType: "integerType",
                },
                name: "name",
            },
            {
                variableType: {
                    integerType: "integerType",
                },
                name: "name",
            },
        ],
        outputType: {
            integerType: "integerType",
        },
        methodName: "methodName",
    });
}
main();
