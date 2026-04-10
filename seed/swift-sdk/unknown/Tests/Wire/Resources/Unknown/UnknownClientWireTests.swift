import Foundation
import Testing
import UnknownAsAny

@Suite("UnknownClient Wire Tests") struct UnknownClientWireTests {
    @Test func post1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "key": "value"
                  },
                  {
                    "key": "value"
                  }
                ]
                """.utf8
            )
        )
        let client = UnknownAsAnyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        ]
        let response = try await client.unknown.post(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func postObject1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "key": "value"
                  },
                  {
                    "key": "value"
                  }
                ]
                """.utf8
            )
        )
        let client = UnknownAsAnyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        ]
        let response = try await client.unknown.postObject(
            request: MyObject(
                unknown: .object([
                    "key": .string("value")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}