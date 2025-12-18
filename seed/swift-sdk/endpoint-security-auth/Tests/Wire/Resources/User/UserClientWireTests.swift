import Foundation
import Testing
import EndpointSecurityAuth

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getWithBearer1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getWithBearer(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithApiKey1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getWithApiKey(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithOAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getWithOAuth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithAnyAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getWithAnyAuth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithAllAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getWithAllAuth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}