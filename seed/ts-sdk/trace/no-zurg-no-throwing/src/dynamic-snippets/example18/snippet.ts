import { SeedTraceClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.problem.updateProblem("problemId", {
        problemName: "problemName",
        problemDescription: {
            boards: [
                {
                    html: "html",
                },
                {
                    html: "html",
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
        testcases: [
            {
                testCase: {
                    id: "id",
                    params: [
                        {
                            integerValue: "integerValue",
                        },
                        {
                            integerValue: "integerValue",
                        },
                    ],
                },
                expectedResult: {
                    integerValue: "integerValue",
                },
            },
            {
                testCase: {
                    id: "id",
                    params: [
                        {
                            integerValue: "integerValue",
                        },
                        {
                            integerValue: "integerValue",
                        },
                    ],
                },
                expectedResult: {
                    integerValue: "integerValue",
                },
            },
        ],
        methodName: "methodName",
    });
}
main();
