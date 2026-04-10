import Foundation
import Testing
import Trace

@Suite("ProblemClient Wire Tests") struct ProblemClientWireTests {
    @Test func createProblem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "success",
                  "value": "string"
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = CreateProblemResponse.success("string")
        let response = try await client.problem.createProblem(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateProblem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "problemVersion": 1
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UpdateProblemResponse(
            problemVersion: 1
        )
        let response = try await client.problem.updateProblem(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getDefaultStarterFiles1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "files": {
                    "JAVA": {
                      "solutionFile": {
                        "filename": "filename",
                        "contents": "contents"
                      },
                      "readOnlyFiles": [
                        {
                          "filename": "filename",
                          "contents": "contents"
                        },
                        {
                          "filename": "filename",
                          "contents": "contents"
                        }
                      ]
                    }
                  }
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetDefaultStarterFilesResponse(
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
            ]
        )
        let response = try await client.problem.getDefaultStarterFiles(
            request: .init(
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
                methodName: "methodName"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}