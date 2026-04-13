import Foundation
import Testing
import Api

@Suite("FileNotificationServiceClient Wire Tests") struct FileNotificationServiceClientWireTests {
    @Test func fileNotificationServiceGetException1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "exceptionType": "exceptionType",
                  "exceptionMessage": "exceptionMessage",
                  "exceptionStacktrace": "exceptionStacktrace",
                  "type": "generic"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Exception.exceptionZero(
            ExceptionZero(
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
                type: .generic
            )
        )
        let response = try await client.fileNotificationService.fileNotificationServiceGetException(
            notificationId: "notificationId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func fileNotificationServiceGetException2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Exception.exceptionZero(
            ExceptionZero(
                type: .generic,
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace"
            )
        )
        let response = try await client.fileNotificationService.fileNotificationServiceGetException(
            notificationId: "notificationId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}