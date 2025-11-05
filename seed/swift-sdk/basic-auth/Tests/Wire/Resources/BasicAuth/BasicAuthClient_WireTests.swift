import Foundation
import Testing
import BasicAuth

@Suite("BasicAuthClient_ Wire Tests") struct BasicAuthClient_WireTests {
    @Test func getWithBasicAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.getWithBasicAuth()
        try #require(response == expectedResponse)
    }

    @Test func getWithBasicAuth2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.getWithBasicAuth()
        try #require(response == expectedResponse)
    }

    @Test func postWithBasicAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.postWithBasicAuth(request: .object([
            "key": .string("value")
        ]))
        try #require(response == expectedResponse)
    }

    @Test func postWithBasicAuth2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.postWithBasicAuth(request: .object([
            "key": .string("value")
        ]))
        try #require(response == expectedResponse)
    }
}