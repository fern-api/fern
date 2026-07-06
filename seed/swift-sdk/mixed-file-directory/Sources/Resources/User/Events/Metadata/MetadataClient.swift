import Foundation

public final class MetadataClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Get event metadata.
    ///
    /// ```swift
    /// import Foundation
    /// import MixedFileDirectory
    /// 
    /// private func main() async throws {
    ///     let client = MixedFileDirectoryClient()
    /// 
    ///     _ = try await client.user.events.metadata.getMetadata(id: "id")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMetadata(id: Id, requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/events/metadata",
            queryParams: [
                "id": .string(id)
            ],
            requestOptions: requestOptions,
            responseType: Metadata.self
        )
    }
}