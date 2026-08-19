import Foundation

public final class ImdbClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Add a movie to the database using the movies/* /... path.
    ///
    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient(token: "<token>")
    ///
    ///     _ = try await client.imdb.createMovie(request: .init(
    ///         title: "title",
    ///         rating: 1.1
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createMovie(request: Requests.CreateMovieRequest, requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movies/create-movie",
            body: request,
            requestOptions: requestOptions,
            responseType: MovieId.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient(token: "<token>")
    ///
    ///     _ = try await client.imdb.getMovie(movieId: "movieId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get,
            path: "/movies/\(movieId)",
            requestOptions: requestOptions,
            responseType: Movie.self
        )
    }
}