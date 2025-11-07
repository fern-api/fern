import Foundation
import Testing
import Examples

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getException1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "generic",
                  "exceptionType": "Unavailable",
                  "exceptionMessage": "This component is unavailable!",
                  "exceptionStacktrace": "<logs>"
                }
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .generic(
            .init(
                exceptionType: "Unavailable",
                exceptionMessage: "This component is unavailable!",
                exceptionStacktrace: "<logs>"
            )
        )
        let response = try await client.file.notification.service.getException(
            notificationId: "notification-hsy129x",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getException2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "generic",
                  "exceptionType": "exceptionType",
                  "exceptionMessage": "exceptionMessage",
                  "exceptionStacktrace": "exceptionStacktrace"
                }
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .generic(
            .init(
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace"
            )
        )
        let response = try await client.file.notification.service.getException(
            notificationId: "notificationId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}