import Foundation

public final class Ec2Client: Sendable {
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
    ///     _ = try await client.ec2.bootInstance(request: .init(size: "size"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func bootInstance(request: Requests.BootInstanceRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/ec2/boot",
            body: request,
            requestOptions: requestOptions
        )
    }
}