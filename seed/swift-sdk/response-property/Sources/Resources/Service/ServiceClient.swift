import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovieDocs(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovieName(request: String, requestOptions: RequestOptions? = nil) async throws -> StringResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: StringResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovieMetadata(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getOptionalMovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response? {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: Response?.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getOptionalMovieDocs(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: OptionalWithDocs.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ResponseProperty
    ///
    /// private func main() async throws {
    ///     let client = ResponsePropertyClient()
    ///
    ///     _ = try await client.service.getMovie(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getOptionalMovieName(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: OptionalStringResponse.self
        )
    }
}