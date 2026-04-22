import Foundation
import Testing
import ResponseProperty

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getMovie1() async throws -> Void {
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
        let client = ResponsePropertyClient(
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
        let response = try await client.service.getMovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getMovieDocs1() async throws -> Void {
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
        let client = ResponsePropertyClient(
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
        let response = try await client.service.getMovieDocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getMovieName1() async throws -> Void {
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
        let client = ResponsePropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StringResponse(
            data: "data"
        )
        let response = try await client.service.getMovieName(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getMovieMetadata1() async throws -> Void {
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
        let client = ResponsePropertyClient(
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
        let response = try await client.service.getMovieMetadata(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getOptionalMovie1() async throws -> Void {
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
        let client = ResponsePropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(Response(
            data: Movie(
                id: "id",
                name: "name"
            ),
            metadata: [
                "metadata": "metadata"
            ],
            docs: "docs"
        ))
        let response = try await client.service.getOptionalMovie(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getOptionalMovieDocs1() async throws -> Void {
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
        let client = ResponsePropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(WithDocs(
            docs: "docs"
        ))
        let response = try await client.service.getOptionalMovieDocs(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getOptionalMovieName1() async throws -> Void {
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
        let client = ResponsePropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(StringResponse(
            data: "data"
        ))
        let response = try await client.service.getOptionalMovieName(
            request: "string",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}