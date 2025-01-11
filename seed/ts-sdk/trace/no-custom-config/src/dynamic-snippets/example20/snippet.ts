import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.getDefaultStarterFiles({
        inputParams: [
            {
                variableType: {
                    type: "integerType",
                },
                name: "name",
            },
            {
                variableType: {
                    type: "integerType",
                },
                name: "name",
            },
        ],
        outputType: {
            type: "integerType",
        },
        methodName: "methodName",
    });
}
main();
