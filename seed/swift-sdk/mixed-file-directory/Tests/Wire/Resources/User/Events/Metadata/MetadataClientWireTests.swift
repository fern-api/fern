import Foundation
import Testing
import MixedFileDirectory

@Suite("MetadataClient Wire Tests") struct MetadataClientWireTests {
    @Test func getMetadata1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "value": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = MixedFileDirectoryClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Metadata(
            id: "id",
            value: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.user.events.metadata.getMetadata(id: "id")
        try #require(response == expectedResponse)
    }
}