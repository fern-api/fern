import Foundation
import Testing
import Api

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func gettokenwithclientcredentials1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional(Nullable<String>.value("refresh_token"))
        )
        let response = try await client.auth.gettokenwithclientcredentials(
            request: .init(
                cid: "cid",
                csr: "csr",
                scp: "scp",
                entityId: "entity_id",
                audience: .httpsApiExampleCom,
                grantType: .clientCredentials
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func gettokenwithclientcredentials2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional(Nullable<String>.value("refresh_token"))
        )
        let response = try await client.auth.gettokenwithclientcredentials(
            request: .init(
                cid: "cid",
                csr: "csr",
                scp: "scp",
                entityId: "entity_id",
                audience: .httpsApiExampleCom,
                grantType: .clientCredentials,
                scope: .value("scope")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func refreshtoken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional(Nullable<String>.value("refresh_token"))
        )
        let response = try await client.auth.refreshtoken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                refreshToken: "refresh_token",
                audience: .httpsApiExampleCom,
                grantType: .refreshToken
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func refreshtoken2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional(Nullable<String>.value("refresh_token"))
        )
        let response = try await client.auth.refreshtoken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                refreshToken: "refresh_token",
                audience: .httpsApiExampleCom,
                grantType: .refreshToken,
                scope: .value("scope")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}