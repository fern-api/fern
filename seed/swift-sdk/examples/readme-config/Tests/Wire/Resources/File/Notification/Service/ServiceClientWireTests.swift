import Foundation
import Testing
import Examples

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getException1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "type": "generic",
                  "exceptionType": "Unavailable",
                  "exceptionMessage": "This component is unavailable!",
                  "exceptionStacktrace": "<logs>"
                }
                """#.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Exception.generic(
            .init(
                exceptionType: "Unavailable",
                exceptionMessage: "This component is unavailable!",
                exceptionStacktrace: "<logs>",
                additionalProperties: [
                    "type": JSONValue.string("generic")
                ]
            )
        )
        let response = try await client.file.notification.service.getException(
            notificationId: "notification-hsy129x",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}