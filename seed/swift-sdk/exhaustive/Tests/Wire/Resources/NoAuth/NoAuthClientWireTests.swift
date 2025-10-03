import Foundation
import Testing
import Exhaustive

@Suite("NoAuthClient Wire Tests") struct NoAuthClientWireTests {
    @Test func postWithNoAuth1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.noAuth.postWithNoAuth(request: .object([
            "key": .string("value")
        ]))
        try #require(response == expectedResponse)
    }
}