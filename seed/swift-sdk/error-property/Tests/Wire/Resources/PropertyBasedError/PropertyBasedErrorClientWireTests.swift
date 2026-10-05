import Foundation
import Testing
import ErrorProperty

@Suite("PropertyBasedErrorClient Wire Tests") struct PropertyBasedErrorClientWireTests {
    @Test func throwError1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                string
                """#.utf8
            )
        )
        let client = ErrorPropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.propertyBasedError.throwError(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func throwErrorThrowsPropertyBasedErrorTest() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "message": "message"
                }
                """#.utf8
            )
        )
        let client = ErrorPropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.propertyBasedError.throwError(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
            Issue.record("Expected ErrorPropertyError.httpError with status code 400")
        } catch ErrorPropertyError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }
}