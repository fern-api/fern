import Foundation

public final class WidgetsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.widgets.create(
    ///         apiVersion: "v1beta",
    ///         request: Widget(
    ///             name: "name"
    ///         )
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func create(apiVersion: String, request: Widget, requestOptions: RequestOptions? = nil) async throws -> Widget {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(apiVersion)/widgets",
            body: request,
            requestOptions: requestOptions,
            responseType: Widget.self
        )
    }
}