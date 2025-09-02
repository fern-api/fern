import Foundation
import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.problem.updateProblem(
        problemId: "problemId",
        request: CreateProblemRequest(
            problemName: "problemName",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            html: 
                        )
                    ),
                    ProblemDescriptionBoard.html(
                        .init(
                            html: 
                        )
                    )
                ]
            ),
            files: [
                .java: ProblemFiles(
                    solutionFile: FileInfo(
                        filename: "filename",
                        contents: "contents"
                    ),
                    readOnlyFiles: [
                        FileInfo(
                            filename: "filename",
                            contents: "contents"
                        ),
                        FileInfo(
                            filename: "filename",
                            contents: "contents"
                        )
                    ]
                )
            ],
            inputParams: [
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                ),
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                )
            ],
            outputType: VariableType.integerType(
                .init(

                )
            ),
            testcases: [
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            ),
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    )
                ),
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            ),
                            VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    )
                )
            ],
            methodName: "methodName"
        )
    )
}

try await main()
