import Foundation
import Testing
import SingleUrlEnvironmentNoDefault

@Suite("DummyClient Wire Tests") struct DummyClientWireTests {
    @Test func getDummy1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = SingleUrlEnvironmentNoDefaultClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.dummy.getDummy()
        try #require(response == expectedResponse)
    }
}