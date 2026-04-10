import Foundation

public final class EndpointsPaginationClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List items with cursor pagination
    ///
    /// - Parameter cursor: The cursor for pagination
    /// - Parameter limit: Maximum number of items to return
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsPaginationListItems(cursor: Nullable<String>? = nil, limit: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> EndpointsPaginatedResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/pagination",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }, 
                "limit": limit?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: EndpointsPaginatedResponse.self
        )
    }
}