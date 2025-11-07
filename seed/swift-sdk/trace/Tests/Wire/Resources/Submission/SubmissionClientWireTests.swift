import Foundation
import Testing
import Trace

@Suite("SubmissionClient Wire Tests") struct SubmissionClientWireTests {
    @Test func createExecutionSession1() async throws -> Void {
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
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional("executionSessionUrl"),
            language: .java,
            status: .creatingContainer
        )
        let response = try await client.submission.createExecutionSession(
            language: .java,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getExecutionSession1() async throws -> Void {
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
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(ExecutionSessionResponse(
            sessionId: "sessionId",
            executionSessionUrl: Optional("executionSessionUrl"),
            language: .java,
            status: .creatingContainer
        ))
        let response = try await client.submission.getExecutionSession(
            sessionId: "sessionId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getExecutionSessionsState1() async throws -> Void {
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
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetExecutionSessionStateResponse(
            states: [
                "states": ExecutionSessionState(
                    lastTimeContacted: Optional("lastTimeContacted"),
                    sessionId: "sessionId",
                    isWarmInstance: true,
                    awsTaskId: Optional("awsTaskId"),
                    language: .java,
                    status: .creatingContainer
                )
            ],
            numWarmingInstances: Optional(1),
            warmingSessionIds: [
                "warmingSessionIds",
                "warmingSessionIds"
            ]
        )
        let response = try await client.submission.getExecutionSessionsState(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}