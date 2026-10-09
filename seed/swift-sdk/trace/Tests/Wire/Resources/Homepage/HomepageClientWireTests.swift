import Foundation
import Testing
import Trace

@Suite("HomepageClient Wire Tests") struct HomepageClientWireTests {
    @Test func getHomepageProblems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                [
                  "string",
                  "string"
                ]
                """#.utf8
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
        let response = try await client.homepage.getHomepageProblems(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func setHomepageProblems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.homepage.setHomepageProblems(
            request: [
                "string",
                "string"
            ],
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}