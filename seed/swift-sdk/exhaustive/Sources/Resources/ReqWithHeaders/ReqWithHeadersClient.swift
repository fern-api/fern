import Foundation

public final class ReqWithHeadersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.reqWithHeaders.getWithCustomHeader(
    ///         xTestServiceHeader: "X-TEST-SERVICE-HEADER",
    ///         xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
    ///         request: "string"
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithCustomHeader(xTestServiceHeader: String, xTestEndpointHeader: String, request: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/test-headers/custom-header",
            headers: [
                "X-TEST-SERVICE-HEADER": xTestServiceHeader, 
                "X-TEST-ENDPOINT-HEADER": xTestEndpointHeader
            ],
            body: request,
            requestOptions: requestOptions
        )
    }
}