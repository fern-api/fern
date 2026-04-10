import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func getUnion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "valueA": "valueA",
                    "type": "A"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UnionResponse(
            data: MyUnion.a(
                .init(
                    valueA: "valueA",
                    additionalProperties: [
                        "type": JSONValue.string("A")
                    ]
                )
            )
        )
        let response = try await client..getUnion(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getUnion2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "type": "A",
                    "valueA": "valueA"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UnionResponse(
            data: MyUnion.a(
                .init(
                    valueA: "valueA",
                    additionalProperties: [
                        "type": JSONValue.string("A")
                    ]
                )
            )
        )
        let response = try await client..getUnion(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listUnions1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "valueA": "valueA",
                      "type": "A"
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UnionListResponse(
            data: [
                MyUnion.a(
                    .init(
                        valueA: "valueA",
                        additionalProperties: [
                            "type": JSONValue.string("A")
                        ]
                    )
                )
            ]
        )
        let response = try await client..listUnions(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listUnions2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "type": "A",
                      "valueA": "valueA"
                    },
                    {
                      "type": "A",
                      "valueA": "valueA"
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UnionListResponse(
            data: [
                MyUnion.a(
                    .init(
                        valueA: "valueA",
                        additionalProperties: [
                            "type": JSONValue.string("A")
                        ]
                    )
                ),
                MyUnion.a(
                    .init(
                        valueA: "valueA",
                        additionalProperties: [
                            "type": JSONValue.string("A")
                        ]
                    )
                )
            ]
        )
        let response = try await client..listUnions(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}