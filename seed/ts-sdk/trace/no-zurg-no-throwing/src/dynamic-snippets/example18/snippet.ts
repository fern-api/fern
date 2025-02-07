import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.updateProblem("problemId", {
        problemName: "problemName",
        problemDescription: {
            boards: [
                {
                    type: "html",
                    value: "boards",
                },
                {
                    type: "html",
                    value: "boards",
                },
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
                            value: 1,
                        },
                        {
                            type: "integerValue",
                            value: 1,
                        },
                    ],
                },
                expectedResult: {
                    type: "integerValue",
                    value: 1,
                },
            },
            {
                testCase: {
                    id: "id",
                    params: [
                        {
                            type: "integerValue",
                            value: 1,
                        },
                        {
                            type: "integerValue",
                            value: 1,
                        },
                    ],
                },
                expectedResult: {
                    type: "integerValue",
                    value: 1,
                },
            },
        ],
        methodName: "methodName",
    });
}
main();
