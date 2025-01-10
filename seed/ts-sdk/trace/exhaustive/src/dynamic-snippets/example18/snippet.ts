import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.updateProblem(SeedTrace.commons.ProblemId("problemId"), {
        problemName: "problemName",
        problemDescription: {
            boards: [
                SeedTrace.problem.ProblemDescriptionBoard.html({}),
                SeedTrace.problem.ProblemDescriptionBoard.html({}),
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
                        SeedTrace.commons.VariableValue.integerValue({}),
                        SeedTrace.commons.VariableValue.integerValue({}),
                    ],
                },
                expectedResult: SeedTrace.commons.VariableValue.integerValue({}),
            },
            {
                testCase: {
                    id: "id",
                    params: [
                        SeedTrace.commons.VariableValue.integerValue({}),
                        SeedTrace.commons.VariableValue.integerValue({}),
                    ],
                },
                expectedResult: SeedTrace.commons.VariableValue.integerValue({}),
            },
        ],
        methodName: "methodName",
    });
}
main();
