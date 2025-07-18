public final class OrganizationsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getOrganization(requestOptions: RequestOptions? = nil) async throws -> Organization {
    }

    public func getOrganizationUser(requestOptions: RequestOptions? = nil) async throws -> User {
    }

    public func searchOrganizations(requestOptions: RequestOptions? = nil) async throws -> [Organization] {
    }
}