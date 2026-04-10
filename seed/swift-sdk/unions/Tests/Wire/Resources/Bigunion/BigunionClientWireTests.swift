import Foundation
import Testing
import Api

@Suite("BigunionClient Wire Tests") struct BigunionClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "value": "value",
                  "type": "normalSweet"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = BigUnion.bigUnionZero(
            BigUnionZero(
                value: "value",
                type: .normalSweet
            )
        )
        let response = try await client.bigunion.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "normalSweet",
                  "value": "value"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = BigUnion.bigUnionZero(
            BigUnionZero(
                type: .normalSweet,
                value: "value"
            )
        )
        let response = try await client.bigunion.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func update1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.bigunion.update(
            request: BigUnion.bigUnionZero(
                BigUnionZero(
                    value: "value",
                    type: .normalSweet
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func update2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.bigunion.update(
            request: BigUnion.bigUnionZero(
                BigUnionZero(
                    value: "value",
                    type: .normalSweet
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateMany1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "key": true
        ]
        let response = try await client.bigunion.updateMany(
            request: [
                BigUnion.bigUnionZero(
                    BigUnionZero(
                        value: "value",
                        type: .normalSweet
                    )
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateMany2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": true
        ]
        let response = try await client.bigunion.updateMany(
            request: [
                BigUnion.bigUnionZero(
                    BigUnionZero(
                        value: "value",
                        type: .normalSweet
                    )
                ),
                BigUnion.bigUnionZero(
                    BigUnionZero(
                        value: "value",
                        type: .normalSweet
                    )
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}