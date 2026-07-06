import Foundation

public final class ConversationsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Place an outbound call or validate call setup with dry_run.
    ///
    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.conversations.outboundCall(request: .init(toPhoneNumber: "to_phone_number"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func outboundCall(request: Requests.OutboundCallConversationsRequest, requestOptions: RequestOptions? = nil) async throws -> OutboundCallConversationsResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/conversations/outbound-call",
            body: request,
            requestOptions: requestOptions,
            responseType: OutboundCallConversationsResponse.self
        )
    }
}