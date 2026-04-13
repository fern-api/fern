import Foundation
import Testing
import Api

@Suite("BasicauthClient Wire Tests") struct BasicauthClientWireTests {
    @Test func getwithbasicauth1() async throws -> Void {
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
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicauth.getwithbasicauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithbasicauth2() async throws -> Void {
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
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicauth.getwithbasicauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func postwithbasicauth1() async throws -> Void {
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
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicauth.postwithbasicauth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}