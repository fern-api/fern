import Foundation
import Testing
import Api

@Suite("NoauthClient Wire Tests") struct NoauthClientWireTests {
    @Test func postwithnoauth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.noauth.postwithnoauth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}