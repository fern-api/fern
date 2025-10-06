import Foundation
import Testing
import CustomAuth

@Suite("CustomAuthClient_ Wire Tests") struct CustomAuthClient_WireTests {
    @Test func getWithCustomAuth1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = CustomAuthClient(
            baseURL: "https://api.fern.com",
            customAuthScheme: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.customAuth.getWithCustomAuth()
        try #require(response == expectedResponse)
    }

    @Test func getWithCustomAuth2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = CustomAuthClient(
            baseURL: "https://api.fern.com",
            customAuthScheme: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.customAuth.getWithCustomAuth()
        try #require(response == expectedResponse)
    }

    @Test func postWithCustomAuth1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = CustomAuthClient(
            baseURL: "https://api.fern.com",
            customAuthScheme: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.customAuth.postWithCustomAuth(request: .object([
            "key": .string("value")
        ]))
        try #require(response == expectedResponse)
    }

    @Test func postWithCustomAuth2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = CustomAuthClient(
            baseURL: "https://api.fern.com",
            customAuthScheme: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.customAuth.postWithCustomAuth(request: .object([
            "key": .string("value")
        ]))
        try #require(response == expectedResponse)
    }
}