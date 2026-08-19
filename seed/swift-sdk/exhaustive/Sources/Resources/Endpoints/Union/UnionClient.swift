import Foundation

public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.union.getAndReturnUnion(request: Animal.dog(
    ///         Dog(
    ///             name: "name",
    ///             likesToWoof: true
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnUnion(request: Animal, requestOptions: RequestOptions? = nil) async throws -> Animal {
        return try await httpClient.performRequest(
            method: .post,
            path: "/union",
            body: request,
            requestOptions: requestOptions,
            responseType: Animal.self
        )
    }
}