import Foundation

public final class UserEventsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List all user events.
    ///
    /// - Parameter limit: The maximum number of results to return.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func userEventsListEvents(limit: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserEvent] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/events",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserEvent].self
        )
    }
}