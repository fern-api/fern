import Foundation
import Testing
import ObjectsWithImports

@Suite("OptionalClient Wire Tests") struct OptionalClientWireTests {
    @Test func sendOptionalBody1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ObjectsWithImportsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.optional.sendOptionalBody(request: [
            "string": .object([
                "key": .string("value")
            ])
        ])
        try #require(response == expectedResponse)
    }
}