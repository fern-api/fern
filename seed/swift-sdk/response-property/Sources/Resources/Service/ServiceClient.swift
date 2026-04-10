import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getmovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    public func getmoviedocs(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/docs",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    public func getmoviename(request: String, requestOptions: RequestOptions? = nil) async throws -> StringResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/name",
            body: request,
            requestOptions: requestOptions,
            responseType: StringResponse.self
        )
    }

    public func getmoviemetadata(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/metadata",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    public func getoptionalmovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/optional",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    public func getoptionalmoviedocs(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/optional/docs",
            body: request,
            requestOptions: requestOptions,
            responseType: OptionalWithDocs.self
        )
    }

    public func getoptionalmoviename(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie/optional/name",
            body: request,
            requestOptions: requestOptions,
            responseType: OptionalStringResponse.self
        )
    }
}