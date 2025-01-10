import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.createProblem({
        problemName: "problemName",
        problemDescription: {
            boards: [
                {
                    type: "html",
                },
                {
                    type: "html",
                },
            ],
        },
        files: {
            JAVA: {
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
        testcases: [
            {
                testCase: {
                    id: "id",
                    params: [
                        {
                            type: "integerValue",
                        },
                        {
                            type: "integerValue",
                        },
                    ],
                },
                expectedResult: {
                    type: "integerValue",
                },
            },
            {
                testCase: {
                    id: "id",
                    params: [
                        {
                            type: "integerValue",
                        },
                        {
                            type: "integerValue",
                        },
                    ],
                },
                expectedResult: {
                    type: "integerValue",
                },
            },
        ],
        methodName: "methodName",
    });
}
main();
