public final class OrganizationClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(request: CreateOrganizationRequest, requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/organizations", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}