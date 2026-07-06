import Foundation

public final class FolderDServiceClient: Sendable {
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
    ///     _ = try await client.folderD.service.getDirectThread()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getDirectThread(requestOptions: RequestOptions? = nil) async throws -> ResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/partner-path",
            requestOptions: requestOptions,
            responseType: ResponseType.self
        )
    }
}