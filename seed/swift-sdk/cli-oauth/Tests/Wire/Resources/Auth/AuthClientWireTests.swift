import Foundation
import Testing
import Api

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.getToken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                scopes: "scopes",
                grantType: .clientCredentials,
                tenant: "tenant"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getToken2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.getToken(
            audience: .pets,
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                scopes: "scopes",
                grantType: .clientCredentials,
                tenant: "tenant",
                optionalHint: "optional_hint"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func refreshToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.refreshToken(
            request: .init(
                refreshToken: "refresh_token",
                grantType: .refreshToken
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func refreshToken2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.refreshToken(
            request: .init(
                refreshToken: "refresh_token",
                grantType: .refreshToken
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}