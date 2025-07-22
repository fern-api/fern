public final class MetadataClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMetadata(id: Id, requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/events/metadata",
            queryParams: [
                "id": .string(id.rawValue)
            ],
            requestOptions: requestOptions,
            responseType: Metadata.self
        )
    }
}