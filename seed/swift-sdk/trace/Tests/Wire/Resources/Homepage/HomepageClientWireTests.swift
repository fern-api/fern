import Foundation
import Testing
import Trace

@Suite("HomepageClient Wire Tests") struct HomepageClientWireTests {
    @Test func getHomepageProblems1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string",
                  "string"
                ]
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.homepage.getHomepageProblems()
        try #require(response == expectedResponse)
    }
}