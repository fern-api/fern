import Foundation
import Testing
import BasicAuthPwOmitted

@Suite("BasicAuthClient Wire Tests") struct BasicAuthClientWireTests {
    @Test func getWithBasicAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = BasicAuthPwOmittedClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.getWithBasicAuth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
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
        let client = BasicAuthPwOmittedClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.getWithBasicAuth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
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
        let client = BasicAuthPwOmittedClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.postWithBasicAuth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
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
        let client = BasicAuthPwOmittedClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.postWithBasicAuth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}