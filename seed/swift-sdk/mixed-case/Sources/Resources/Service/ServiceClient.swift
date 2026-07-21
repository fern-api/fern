import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import MixedCase
    ///
    /// private func main() async throws {
    ///     let client = MixedCaseClient()
    ///
    ///     _ = try await client.service.getResource(resourceId: "rsc-xyz")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getResource(resourceId: String, requestOptions: RequestOptions? = nil) async throws -> Resource {
        return try await httpClient.performRequest(
            method: .get,
            path: "/resource/\(resourceId)",
            requestOptions: requestOptions,
            responseType: Resource.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import MixedCase
    ///
    /// private func main() async throws {
    ///     let client = MixedCaseClient()
    ///
    ///     _ = try await client.service.listResources(
    ///         pageLimit: 10,
    ///         beforeDate: CalendarDate("2023-01-01")!
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listResources(pageLimit: Int, beforeDate: CalendarDate, requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/resource",
            queryParams: [
                "page_limit": .int(pageLimit), 
                "beforeDate": .calendarDate(beforeDate)
            ],
            requestOptions: requestOptions,
            responseType: [Resource].self
        )
    }
}