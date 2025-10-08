import Foundation
import Testing
import PlainText

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getText1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = PlainTextClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getText()
        try #require(response == expectedResponse)
    }
}