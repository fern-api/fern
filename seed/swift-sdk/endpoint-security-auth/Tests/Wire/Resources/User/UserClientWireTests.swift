import Foundation
import Testing
import Api

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getwithbearer1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithbearer(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithbearer2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithbearer(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithapikey1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithapikey(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithapikey2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithapikey(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithoauth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithoauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithoauth2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithoauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithbasic1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithbasic(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithbasic2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithbasic(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithinferredauth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithinferredauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithinferredauth2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithinferredauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithanyauth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithanyauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithanyauth2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithanyauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithallauth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getwithallauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getwithallauth2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-API-Key>",
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
        let response = try await client.user.getwithallauth(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}