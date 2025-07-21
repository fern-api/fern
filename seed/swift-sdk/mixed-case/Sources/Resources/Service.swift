public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getResource(resourceId: String, requestOptions: RequestOptions? = nil) async throws -> Resource {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/resource/\(resourceId)", 
            requestOptions: requestOptions
        )
    }

    public func listResources(requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/resource", 
            requestOptions: requestOptions
        )
    }
}