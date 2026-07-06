import Foundation

public final class StatusClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Websocket
    /// 
    /// private func main() async throws {
    ///     let client = WebsocketClient()
    /// 
    ///     _ = try await client.status.getStatus()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getStatus(requestOptions: RequestOptions? = nil) async throws -> StatusResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/status",
            requestOptions: requestOptions,
            responseType: StatusResponse.self
        )
    }
}