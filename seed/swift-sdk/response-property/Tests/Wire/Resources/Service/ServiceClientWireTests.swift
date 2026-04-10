import Foundation
import Testing
import Api

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getmovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs",
                  "metadata": {
                    "key": "value"
                  },
                  "data": {
                    "id": "id",
                    "name": "name"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            docs: "docs",
            metadata: [
                "key": "value"
            ],
            data: Movie(
                id: "id",
                name: "name"
            )
        )
        let response = try await client.service.getmovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmovie2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "id": "id",
                    "name": "name"
                  },
                  "metadata": {
                    "metadata": "metadata"
                  },
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            data: Movie(
                id: "id",
                name: "name"
            ),
            metadata: [
                "metadata": "metadata"
            ],
            docs: "docs"
        )
        let response = try await client.service.getmovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviedocs1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs",
                  "metadata": {
                    "key": "value"
                  },
                  "data": {
                    "id": "id",
                    "name": "name"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            docs: "docs",
            metadata: [
                "key": "value"
            ],
            data: Movie(
                id: "id",
                name: "name"
            )
        )
        let response = try await client.service.getmoviedocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviedocs2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "id": "id",
                    "name": "name"
                  },
                  "metadata": {
                    "metadata": "metadata"
                  },
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            data: Movie(
                id: "id",
                name: "name"
            ),
            metadata: [
                "metadata": "metadata"
            ],
            docs: "docs"
        )
        let response = try await client.service.getmoviedocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviename1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": "data"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StringResponse(
            data: "data"
        )
        let response = try await client.service.getmoviename(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviename2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": "data"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StringResponse(
            data: "data"
        )
        let response = try await client.service.getmoviename(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviemetadata1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs",
                  "metadata": {
                    "key": "value"
                  },
                  "data": {
                    "id": "id",
                    "name": "name"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            docs: "docs",
            metadata: [
                "key": "value"
            ],
            data: Movie(
                id: "id",
                name: "name"
            )
        )
        let response = try await client.service.getmoviemetadata(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmoviemetadata2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "id": "id",
                    "name": "name"
                  },
                  "metadata": {
                    "metadata": "metadata"
                  },
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            data: Movie(
                id: "id",
                name: "name"
            ),
            metadata: [
                "metadata": "metadata"
            ],
            docs: "docs"
        )
        let response = try await client.service.getmoviemetadata(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs",
                  "metadata": {
                    "key": "value"
                  },
                  "data": {
                    "id": "id",
                    "name": "name"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            docs: "docs",
            metadata: [
                "key": "value"
            ],
            data: Movie(
                id: "id",
                name: "name"
            )
        )
        let response = try await client.service.getoptionalmovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmovie2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "id": "id",
                    "name": "name"
                  },
                  "metadata": {
                    "metadata": "metadata"
                  },
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            data: Movie(
                id: "id",
                name: "name"
            ),
            metadata: [
                "metadata": "metadata"
            ],
            docs: "docs"
        )
        let response = try await client.service.getoptionalmovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmoviedocs1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = WithDocs(
            docs: "docs"
        )
        let response = try await client.service.getoptionalmoviedocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmoviedocs2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "docs": "docs"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = WithDocs(
            docs: "docs"
        )
        let response = try await client.service.getoptionalmoviedocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmoviename1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": "data"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StringResponse(
            data: "data"
        )
        let response = try await client.service.getoptionalmoviename(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getoptionalmoviename2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": "data"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StringResponse(
            data: "data"
        )
        let response = try await client.service.getoptionalmoviename(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}