import Foundation

public final class OrganizationsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getorganization(tenantId: String, organizationId: String, requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)",
            requestOptions: requestOptions,
            responseType: Organization.self
        )
    }

    public func getorganizationuser(tenantId: String, organizationId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)/users/\(userId)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func searchorganizations(tenantId: String, organizationId: String, limit: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> [Organization] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/organizations/\(organizationId)/search",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Organization].self
        )
    }
}