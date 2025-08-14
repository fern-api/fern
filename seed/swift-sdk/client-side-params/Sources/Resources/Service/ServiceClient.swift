import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List resources with pagination
    ///
    /// - Parameter page: Zero-indexed page number
    /// - Parameter perPage: Number of items per page
    /// - Parameter sort: Sort field
    /// - Parameter order: Sort order (asc or desc)
    /// - Parameter includeTotals: Whether to include total count
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter search: Search query
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listResources(page: Int, perPage: Int, sort: String, order: String, includeTotals: Bool, fields: String? = nil, search: String? = nil, requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/resources",
            queryParams: [
                "page": .int(page), 
                "per_page": .int(perPage), 
                "sort": .string(sort), 
                "order": .string(order), 
                "include_totals": .bool(includeTotals), 
                "fields": fields.map { .string($0) }, 
                "search": search.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Resource].self
        )
    }

    /// Get a single resource
    ///
    /// - Parameter includeMetadata: Include metadata in response
    /// - Parameter format: Response format
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getResource(resourceId: String, includeMetadata: Bool, format: String, requestOptions: RequestOptions? = nil) async throws -> Resource {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/resources/\(resourceId)",
            queryParams: [
                "include_metadata": .bool(includeMetadata), 
                "format": .string(format)
            ],
            requestOptions: requestOptions,
            responseType: Resource.self
        )
    }

    /// Search resources with complex parameters
    ///
    /// - Parameter limit: Maximum results to return
    /// - Parameter offset: Offset for pagination
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchResources(limit: Int, offset: Int, request: SearchResourcesRequest, requestOptions: RequestOptions? = nil) async throws -> SearchResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/resources/search",
            queryParams: [
                "limit": .int(limit), 
                "offset": .int(offset)
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: SearchResponse.self
        )
    }
}