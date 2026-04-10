import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "decimal": 1.1,
                  "even": 1,
                  "name": "name",
                  "shape": "SQUARE"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = `Type`(
            decimal: 1.1,
            even: 1,
            name: "name",
            shape: .square
        )
        let response = try await client..create(
            request: .init(
                decimal: 1.1,
                even: 1,
                name: "name",
                shape: .square
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func create2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "decimal": 1.1,
                  "even": 1,
                  "name": "name",
                  "shape": "SQUARE"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = `Type`(
            decimal: 1.1,
            even: 1,
            name: "name",
            shape: .square
        )
        let response = try await client..create(
            request: .init(
                decimal: 1.1,
                even: 1,
                name: "name",
                shape: .square
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "decimal": 1.1,
                  "even": 1,
                  "name": "name",
                  "shape": "SQUARE"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = `Type`(
            decimal: 1.1,
            even: 1,
            name: "name",
            shape: .square
        )
        let response = try await client..get(
            decimal: 1.1,
            even: 1,
            name: "name",
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
                  "decimal": 1.1,
                  "even": 1,
                  "name": "name",
                  "shape": "SQUARE"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = `Type`(
            decimal: 1.1,
            even: 1,
            name: "name",
            shape: .square
        )
        let response = try await client..get(
            decimal: 1.1,
            even: 1,
            name: "name",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}