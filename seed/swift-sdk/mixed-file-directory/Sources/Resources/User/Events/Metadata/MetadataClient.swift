import Foundation

public final class MetadataClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Get event metadata.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMetadata(id: Id, requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/events/metadata",
            queryParams: [
                "id": .string(id)
            ],
            requestOptions: requestOptions,
            responseType: Metadata.self
        )
    }
}