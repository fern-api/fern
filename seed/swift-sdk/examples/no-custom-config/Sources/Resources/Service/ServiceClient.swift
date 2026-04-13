import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getmovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get,
            path: "/movie/\(movieId)",
            requestOptions: requestOptions,
            responseType: Movie.self
        )
    }

    public func createmovie(request: Movie, requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: MovieId.self
        )
    }

    public func getmetadata(apiVersion: String, shallow: Nullable<Bool>? = nil, tag: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get,
            path: "/metadata",
            headers: [
                "X-API-Version": apiVersion
            ],
            queryParams: [
                "shallow": shallow?.wrappedValue.map { .bool($0) }, 
                "tag": tag?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: Metadata.self
        )
    }

    public func createbigentity(request: Requests.BigEntity, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/big-entity",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    public func refreshtoken(request: Requests.RefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/refresh-token",
            body: request,
            requestOptions: requestOptions
        )
    }
}