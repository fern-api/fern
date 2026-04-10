import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.problem.createproblem(request: CreateProblemRequest(
        problemName: "problemName",
        problemDescription: ProblemDescription(
            boards: [
                ProblemDescriptionBoard.html(
                    ProblemDescriptionBoardHtml(

                    )
                )
            ]
        ),
        files: [
            "key": ProblemFiles(
                solutionFile: FileInfo(
                    filename: "filename",
                    contents: "contents"
                ),
                readOnlyFiles: [
                    FileInfo(
                        filename: "filename",
                        contents: "contents"
                    )
                ]
            )
        ],
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.variableTypeZero(
                    VariableTypeZero(
                        type: .integerType
                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.variableTypeZero(
            VariableTypeZero(
                type: .integerType
            )
        ),
        testcases: [
            TestCaseWithExpectedResult(
                testCase: TestCase(
                    id: "id",
                    params: [
                        VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue
                            )
                        )
                    ]
                ),
                expectedResult: VariableValue.variableValueZero(
                    VariableValueZero(
                        type: .integerValue
                    )
                )
            )
        ],
        methodName: "methodName"
    ))
}

try await main()
