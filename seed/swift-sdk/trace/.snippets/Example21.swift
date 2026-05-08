import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.problem.updateProblem(
        problemId: "problemId",
        request: CreateProblemRequest(
            problemName: "problemName",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(

                    ),
                    ProblemDescriptionBoard.html(

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
                    variableType: VariableType.integerType,
                    name: "name"
                ),
                VariableTypeAndName(
                    variableType: VariableType.integerType,
                    name: "name"
                )
            ],
            outputType: VariableType.integerType,
            testcases: [
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(

                            ),
                            VariableValue.integerValue(

                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(

                    )
                ),
                TestCaseWithExpectedResult(
                    testCase: TestCase(
                        id: "id",
                        params: [
                            VariableValue.integerValue(

                            ),
                            VariableValue.integerValue(

                            )
                        ]
                    ),
                    expectedResult: VariableValue.integerValue(

                    )
                )
            ],
            methodName: "methodName"
        )
    )
}

try await main()
