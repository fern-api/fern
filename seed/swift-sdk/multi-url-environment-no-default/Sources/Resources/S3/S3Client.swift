import Foundation

public final class S3Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import MultiUrlEnvironmentNoDefault
    /// 
    /// private func main() async throws {
    ///     let client = MultiUrlEnvironmentNoDefaultClient(token: "<token>")
    /// 
    ///     _ = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getPresignedUrl(request: Requests.GetPresignedUrlRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/s3/presigned-url",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}