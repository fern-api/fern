import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import PlainText
    /// 
    /// private func main() async throws {
    ///     let client = PlainTextClient()
    /// 
    ///     _ = try await client.service.getText()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getText(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/text",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import PlainText
    /// 
    /// private func main() async throws {
    ///     let client = PlainTextClient()
    /// 
    ///     _ = try await client.service.getCsv()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getCsv(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/csv",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import PlainText
    /// 
    /// private func main() async throws {
    ///     let client = PlainTextClient()
    /// 
    ///     _ = try await client.service.getXml()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getXml(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/xml",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}