import Foundation

public final class OrganizationsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import PathParameters
    /// 
    /// private func main() async throws {
    ///     let client = PathParametersClient()
    /// 
    ///     _ = try await client.organizations.getOrganization(
    ///         tenantId: "tenant_id",
    ///         organizationId: "organization_id"
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getOrganization(tenantId: String, organizationId: String, requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)",
            requestOptions: requestOptions,
            responseType: Organization.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import PathParameters
    /// 
    /// private func main() async throws {
    ///     let client = PathParametersClient()
    /// 
    ///     _ = try await client.organizations.getOrganizationUser(
    ///         tenantId: "tenant_id",
    ///         organizationId: "organization_id",
    ///         userId: "user_id"
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getOrganizationUser(tenantId: String, organizationId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)/users/\(userId)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import PathParameters
    /// 
    /// private func main() async throws {
    ///     let client = PathParametersClient()
    /// 
    ///     _ = try await client.organizations.searchOrganizations(
    ///         tenantId: "tenant_id",
    ///         organizationId: "organization_id",
    ///         limit: 1
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchOrganizations(tenantId: String, organizationId: String, limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [Organization] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)/search",
            queryParams: [
                "limit": limit.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Organization].self
        )
    }
}