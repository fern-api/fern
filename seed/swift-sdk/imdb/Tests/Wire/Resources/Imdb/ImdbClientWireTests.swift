import Foundation
import Testing
import Api

@Suite("ImdbClient Wire Tests") struct ImdbClientWireTests {
    @Test func createMovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 201,
            body: Foundation.Data(
                #"""
                string
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.imdb.createMovie(
            request: .init(
                title: "title",
                rating: 1.1
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getMovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "title": "title",
                  "rating": 1.1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Movie(
            id: "id",
            title: "title",
            rating: 1.1
        )
        let response = try await client.imdb.getMovie(
            movieId: "movieId",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getMovieThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                "string"
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.imdb.getMovie(
                movieId: "movieId",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 404")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == "\"string\"")
        }
    }
}