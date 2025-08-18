import Foundation

public final class EventsClient: Sendable {
    public let metadata: MetadataClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.metadata = MetadataClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    /// List all user events.
    ///
    /// - Parameter limit: The maximum number of results to return.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listEvents(limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [Event] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/events",
            queryParams: [
                "limit": limit.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Event].self
        )
    }
}