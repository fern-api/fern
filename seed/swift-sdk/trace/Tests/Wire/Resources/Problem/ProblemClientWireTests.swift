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
        let expectedResponse = "string"
        let response = try await client.problem.createProblem(
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
                methodName: "methodName"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}