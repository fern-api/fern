public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(pathParam: String, serviceParam: String, endpointParam: String, resourceParam: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/test/\(pathParam)/\(serviceParam)/\(endpointParam)/\(resourceParam)",
            requestOptions: requestOptions
        )
    }
}