import Foundation
import Testing
import BearerTokenEnvironmentVariable

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getWithBearerToken1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getWithBearerToken()
        try #require(response == expectedResponse)
    }
}