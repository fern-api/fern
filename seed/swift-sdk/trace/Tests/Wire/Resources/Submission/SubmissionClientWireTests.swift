import Foundation
import Testing
import Api

@Suite("SubmissionClient Wire Tests") struct SubmissionClientWireTests {
    @Test func createexecutionsession1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "sessionId": "sessionId",
                  "executionSessionUrl": "executionSessionUrl",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional(Nullable<String>.value("executionSessionUrl")),
            language: .java,
            status: .creatingContainer
        )
        let response = try await client.submission.createexecutionsession(
            language: .java,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createexecutionsession2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "sessionId": "sessionId",
                  "executionSessionUrl": "executionSessionUrl",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional(Nullable<String>.value("executionSessionUrl")),
            language: .java,
            status: .creatingContainer
        )
        let response = try await client.submission.createexecutionsession(
            language: .java,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getexecutionsession1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "sessionId": "sessionId",
                  "executionSessionUrl": "executionSessionUrl",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional(Nullable<String>.value("executionSessionUrl")),
            language: .java,
            status: .creatingContainer
        )
        let response = try await client.submission.getexecutionsession(
            sessionId: "sessionId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getexecutionsession2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "sessionId": "sessionId",
                  "executionSessionUrl": "executionSessionUrl",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional(Nullable<String>.value("executionSessionUrl")),
            language: .java,
            status: .creatingContainer
        )
        let response = try await client.submission.getexecutionsession(
            sessionId: "sessionId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getexecutionsessionsstate1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "states": {
                    "key": {
                      "lastTimeContacted": "lastTimeContacted",
                      "sessionId": "sessionId",
                      "isWarmInstance": true,
                      "awsTaskId": "awsTaskId",
                      "language": "JAVA",
                      "status": "CREATING_CONTAINER"
                    }
                  },
                  "numWarmingInstances": 1,
                  "warmingSessionIds": [
                    "warmingSessionIds"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetExecutionSessionStateResponse(
            states: [
                "key": ExecutionSessionState(
                    lastTimeContacted: Optional(Nullable<String>.value("lastTimeContacted")),
                    sessionId: "sessionId",
                    isWarmInstance: true,
                    awsTaskId: Optional(Nullable<String>.value("awsTaskId")),
                    language: .java,
                    status: .creatingContainer
                )
            ],
            numWarmingInstances: Optional(Nullable<Int>.value(1)),
            warmingSessionIds: [
                "warmingSessionIds"
            ]
        )
        let response = try await client.submission.getexecutionsessionsstate(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getexecutionsessionsstate2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "states": {
                    "states": {
                      "lastTimeContacted": "lastTimeContacted",
                      "sessionId": "sessionId",
                      "isWarmInstance": true,
                      "awsTaskId": "awsTaskId",
                      "language": "JAVA",
                      "status": "CREATING_CONTAINER"
                    }
                  },
                  "numWarmingInstances": 1,
                  "warmingSessionIds": [
                    "warmingSessionIds",
                    "warmingSessionIds"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetExecutionSessionStateResponse(
            states: [
                "states": ExecutionSessionState(
                    lastTimeContacted: Optional(Nullable<String>.value("lastTimeContacted")),
                    sessionId: "sessionId",
                    isWarmInstance: true,
                    awsTaskId: Optional(Nullable<String>.value("awsTaskId")),
                    language: .java,
                    status: .creatingContainer
                )
            ],
            numWarmingInstances: Optional(Nullable<Int>.value(1)),
            warmingSessionIds: [
                "warmingSessionIds",
                "warmingSessionIds"
            ]
        )
        let response = try await client.submission.getexecutionsessionsstate(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}