import Foundation
import Trace

enum Example21 {
    static func snippet() async throws {
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
                            "boards"
                        ),
                        ProblemDescriptionBoard.html(
                            "boards"
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
                                    1
                                ),
                                VariableValue.integerValue(
                                    1
                                )
                            ]
                        ),
                        expectedResult: VariableValue.integerValue(
                            1
                        )
                    ),
                    TestCaseWithExpectedResult(
                        testCase: TestCase(
                            id: "id",
                            params: [
                                VariableValue.integerValue(
                                    1
                                ),
                                VariableValue.integerValue(
                                    1
                                )
                            ]
                        ),
                        expectedResult: VariableValue.integerValue(
                            1
                        )
                    )
                ],
                methodName: "methodName"
            )
        )
    }
}
