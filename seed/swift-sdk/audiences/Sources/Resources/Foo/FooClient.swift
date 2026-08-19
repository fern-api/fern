import Foundation

public final class FooClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Audiences
    ///
    /// private func main() async throws {
    ///     let client = AudiencesClient()
    ///
    ///     _ = try await client.foo.find(
    ///         optionalString: "optionalString",
    ///         request: .init(
    ///             publicProperty: "publicProperty",
    ///             privateProperty: 1
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func find(optionalString: OptionalString, request: Requests.FindRequest, requestOptions: RequestOptions? = nil) async throws -> ImportingType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            queryParams: [
                "optionalString": optionalString.map { .string($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: ImportingType.self
        )
    }
}