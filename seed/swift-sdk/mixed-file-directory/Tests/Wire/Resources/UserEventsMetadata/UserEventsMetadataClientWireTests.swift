import Foundation
import Testing
import Api

@Suite("UserEventsMetadataClient Wire Tests") struct UserEventsMetadataClientWireTests {
    @Test func userEventsMetadataGetMetadata1() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsereventsMetadata(
            id: "id",
            value: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.userEventsMetadata.userEventsMetadataGetMetadata(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func userEventsMetadataGetMetadata2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsereventsMetadata(
            id: "id",
            value: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.userEventsMetadata.userEventsMetadataGetMetadata(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}