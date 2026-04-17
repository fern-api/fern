import Foundation

public final class ImdbClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// @beta This endpoint is in pre-release and may change.
    ///
    /// Add a movie to the database using the movies/* /... path.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createMovie(request: CreateMovieRequest, requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movies/create-movie",
            body: request,
            requestOptions: requestOptions,
            responseType: MovieId.self
        )
    }

    @available(*, deprecated) public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get,
            path: "/movies/\(movieId)",
            requestOptions: requestOptions,
            responseType: Movie.self
        )
    }
}