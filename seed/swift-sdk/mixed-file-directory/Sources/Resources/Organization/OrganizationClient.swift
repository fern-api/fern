import Foundation

public final class OrganizationClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Create a new organization.
    ///
    /// ```swift
    /// import Foundation
    /// import MixedFileDirectory
    /// 
    /// private func main() async throws {
    ///     let client = MixedFileDirectoryClient()
    /// 
    ///     _ = try await client.organization.create(request: CreateOrganizationRequest(
    ///         name: "name"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func create(request: CreateOrganizationRequest, requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .post,
            path: "/organizations",
            body: request,
            requestOptions: requestOptions,
            responseType: Organization.self
        )
    }
}