import Foundation

public final class FileServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// This endpoint returns a file by its name.
    ///
    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.file.service.getFile(
    ///         filename: "file.txt",
    ///         xFileApiVersion: "0.0.2"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter filename: This is a filename
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getFile(filename: String, xFileApiVersion: String, requestOptions: RequestOptions? = nil) async throws -> File {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/\(filename)",
            headers: [
                "X-File-API-Version": xFileApiVersion
            ],
            requestOptions: requestOptions,
            responseType: File.self
        )
    }
}