import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.createProblem({
        problemName: "problemName",
        problemDescription: {
            boards: [
                SeedTrace.problem.ProblemDescriptionBoard.html({
                    value: "boards",
                }),
                SeedTrace.problem.ProblemDescriptionBoard.html({
                    value: "boards",
                }),
            ],
        },
        files: {
            "JAVA": {
                solutionFile: {
                    filename: "filename",
                    contents: "contents",
                },
                readOnlyFiles: [
                    {
                        filename: "filename",
                        contents: "contents",
                    },
                    {
                        filename: "filename",
                        contents: "contents",
                    },
                ],
            },
        },
        inputParams: [
            {
                variableType: SeedTrace.commons.VariableType.integerType(),
                name: "name",
            },
            {
                variableType: SeedTrace.commons.VariableType.integerType(),
                name: "name",
            },
        ],
        outputType: SeedTrace.commons.VariableType.integerType(),
        testcases: [
            {
                testCase: {
                    id: "id",
                    params: [
                        SeedTrace.commons.VariableValue.integerValue({
                            value: 1,
                        }),
                        SeedTrace.commons.VariableValue.integerValue({
                            value: 1,
                        }),
                    ],
                },
                expectedResult: SeedTrace.commons.VariableValue.integerValue({
                    value: 1,
                }),
            },
            {
                testCase: {
                    id: "id",
                    params: [
                        SeedTrace.commons.VariableValue.integerValue({
                            value: 1,
                        }),
                        SeedTrace.commons.VariableValue.integerValue({
                            value: 1,
                        }),
                    ],
                },
                expectedResult: SeedTrace.commons.VariableValue.integerValue({
                    value: 1,
                }),
            },
        ],
        methodName: "methodName",
    });
}
main();
