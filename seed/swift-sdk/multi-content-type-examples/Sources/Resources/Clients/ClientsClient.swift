import Foundation

public final class ClientsClient: Sendable {
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
    ///     _ = try await client.clients.create(request: .init(client: Client(
    ///         name: "Acme Corp",
    ///         email: "contact@acme.com"
    ///     )))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func create(request: Requests.ClientRequest, requestOptions: RequestOptions? = nil) async throws -> ClientResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/clients",
            body: request,
            requestOptions: requestOptions,
            responseType: ClientResponse.self
        )
    }
}