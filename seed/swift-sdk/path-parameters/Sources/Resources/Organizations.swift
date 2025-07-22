public final class OrganizationsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getOrganization(tenantId: String, organizationId: String, requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(tenantId)/organizations/\(organizationId)", 
            requestOptions: requestOptions, 
            responseType: Organization.self
        )
    }

    public func getOrganizationUser(tenantId: String, organizationId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(tenantId)/organizations/\(organizationId)/users/\(userId)", 
            requestOptions: requestOptions, 
            responseType: User.self
        )
    }

    public func searchOrganizations(tenantId: String, organizationId: String, limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [Organization] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(tenantId)/organizations/\(organizationId)/search", 
            queryParams: [
                "limit": limit.map { .string($0) }
            ], 
            requestOptions: requestOptions, 
            responseType: [Organization].self
        )
    }
}