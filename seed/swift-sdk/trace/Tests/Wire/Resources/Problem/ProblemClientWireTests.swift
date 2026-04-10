import Foundation
import Testing
import Api

@Suite("ProblemClient Wire Tests") struct ProblemClientWireTests {
    @Test func createproblem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "value": "value",
                  "type": "success"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = CreateProblemResponse.success(
            .init(
                value: Optional("value"),
                additionalProperties: [
                    "type": JSONValue.string("success")
                ]
            )
        )
        let response = try await client.problem.createproblem(
            request: CreateProblemRequest(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createproblem2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "success",
                  "value": "value"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = CreateProblemResponse.success(
            .init(
                value: Optional("value"),
                additionalProperties: [
                    "type": JSONValue.string("success")
                ]
            )
        )
        let response = try await client.problem.createproblem(
            request: CreateProblemRequest(
                problemName: "problemName",
                problemDescription: ProblemDescription(
                    boards: [
                        ProblemDescriptionBoard.html(
                            ProblemDescriptionBoardHtml(
                                value: "value"
                            )
                        ),
                        ProblemDescriptionBoard.html(
                            ProblemDescriptionBoardHtml(
                                value: "value"
                            )
                        )
                    ]
                ),
                files: [
                    "files": ProblemFiles(
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
                        variableType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        ),
                        name: "name"
                    ),
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
                                        type: .integerValue,
                                        value: 1
                                    )
                                ),
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                )
                            ]
                        ),
                        expectedResult: VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: 1
                            )
                        )
                    ),
                    TestCaseWithExpectedResult(
                        testCase: TestCase(
                            id: "id",
                            params: [
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                ),
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                )
                            ]
                        ),
                        expectedResult: VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: 1
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

    @Test func updateproblem1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UpdateProblemResponse(
            problemVersion: 1
        )
        let response = try await client.problem.updateproblem(
            problemId: "problemId",
            request: .init(body: CreateProblemRequest(
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
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateproblem2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UpdateProblemResponse(
            problemVersion: 1
        )
        let response = try await client.problem.updateproblem(
            problemId: "problemId",
            request: .init(body: CreateProblemRequest(
                problemName: "problemName",
                problemDescription: ProblemDescription(
                    boards: [
                        ProblemDescriptionBoard.html(
                            ProblemDescriptionBoardHtml(
                                value: "value"
                            )
                        ),
                        ProblemDescriptionBoard.html(
                            ProblemDescriptionBoardHtml(
                                value: "value"
                            )
                        )
                    ]
                ),
                files: [
                    "files": ProblemFiles(
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
                        variableType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        ),
                        name: "name"
                    ),
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
                                        type: .integerValue,
                                        value: 1
                                    )
                                ),
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                )
                            ]
                        ),
                        expectedResult: VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: 1
                            )
                        )
                    ),
                    TestCaseWithExpectedResult(
                        testCase: TestCase(
                            id: "id",
                            params: [
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                ),
                                VariableValue.variableValueZero(
                                    VariableValueZero(
                                        type: .integerValue,
                                        value: 1
                                    )
                                )
                            ]
                        ),
                        expectedResult: VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: 1
                            )
                        )
                    )
                ],
                methodName: "methodName"
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getdefaultstarterfiles1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "files": {
                    "key": {
                      "solutionFile": {
                        "filename": "filename",
                        "contents": "contents"
                      },
                      "readOnlyFiles": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetDefaultStarterFilesResponse(
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
            ]
        )
        let response = try await client.problem.getdefaultstarterfiles(
            request: .init(
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
                methodName: "methodName"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getdefaultstarterfiles2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "files": {
                    "files": {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetDefaultStarterFilesResponse(
            files: [
                "files": ProblemFiles(
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
        let response = try await client.problem.getdefaultstarterfiles(
            request: .init(
                inputParams: [
                    VariableTypeAndName(
                        variableType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        ),
                        name: "name"
                    ),
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
                methodName: "methodName"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}