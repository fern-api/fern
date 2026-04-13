import Foundation
import Testing
import Api

@Suite("DummyClient Wire Tests") struct DummyClientWireTests {
    @Test func generate1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StreamResponse(
            id: "id",
            name: Optional(Nullable<String>.value("name"))
        )
        let response = try await client.dummy.generate(
            request: .init(
                stream: true,
                numEvents: 1
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func generate2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StreamResponse(
            id: "id",
            name: Optional(Nullable<String>.value("name"))
        )
        let response = try await client.dummy.generate(
            request: .init(
                stream: true,
                numEvents: 1
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}