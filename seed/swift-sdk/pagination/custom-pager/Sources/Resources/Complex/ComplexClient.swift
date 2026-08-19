import Foundation

public final class ComplexClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.complex.search(
    ///         index: "index",
    ///         request: SearchRequest(
    ///             pagination: StartingAfterPaging(
    ///                 perPage: 1,
    ///                 startingAfter: "starting_after"
    ///             ),
    ///             query: SearchRequestQuery.singleFilterSearchRequest(
    ///                 SingleFilterSearchRequest(
    ///                     field: "field",
    ///                     operator: .equals,
    ///                     value: "value"
    ///                 )
    ///             )
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func search(index: String, request: SearchRequest, requestOptions: RequestOptions? = nil) async throws -> PaginatedConversationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(index)/conversations/search",
            body: request,
            requestOptions: requestOptions,
            responseType: PaginatedConversationResponse.self
        )
    }
}