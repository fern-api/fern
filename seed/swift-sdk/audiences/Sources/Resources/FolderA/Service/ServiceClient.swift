import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Audiences
    ///
    /// private func main() async throws {
    ///     let client = AudiencesClient()
    ///
    ///     _ = try await client.folderA.service.getDirectThread(
    ///         ids: [
    ///             "ids"
    ///         ],
    ///         tags: [
    ///             "tags"
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getDirectThread(ids: [String], tags: [String], requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            queryParams: [
                "ids": .stringArray(ids), 
                "tags": .stringArray(tags)
            ],
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }
}