import Foundation

public final class MessagesMessagesClient: Sendable {
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
    ///     _ = try await client.messages.messages.listMessages()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listMessages(requestOptions: RequestOptions? = nil) async throws -> [Message] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/messages",
            requestOptions: requestOptions,
            responseType: [Message].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.messages.messages.createMessage(request: Message(
    ///         sid: "sid",
    ///         body: "body"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createMessage(request: Message, requestOptions: RequestOptions? = nil) async throws -> Message {
        return try await httpClient.performRequest(
            method: .post,
            path: "/messages",
            body: request,
            requestOptions: requestOptions,
            responseType: Message.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.messages.messages.deleteMessage(sid: "sid")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteMessage(sid: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/messages/\(sid)",
            requestOptions: requestOptions
        )
    }
}