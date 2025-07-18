public final class OrganizationsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getOrganization(requestOptions: RequestOptions? = nil) throws -> Organization {
    }

    public func getOrganizationUser(requestOptions: RequestOptions? = nil) throws -> User {
    }

    public func searchOrganizations(requestOptions: RequestOptions? = nil) throws -> [Organization] {
    }
}