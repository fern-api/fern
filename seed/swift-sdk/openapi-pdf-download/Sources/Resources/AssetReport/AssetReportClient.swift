import Foundation

public final class AssetReportClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.assetReport.getPdf(request: AssetReportPdfGetRequest(
    ///         assetReportToken: "asset_report_token"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getPdf(request: AssetReportPdfGetRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/asset_report/pdf/get",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.assetReport.get(request: AssetReportPdfGetRequest(
    ///         assetReportToken: "asset_report_token"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(request: AssetReportPdfGetRequest, requestOptions: RequestOptions? = nil) async throws -> AssetReportGetResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/asset_report/get",
            body: request,
            requestOptions: requestOptions,
            responseType: AssetReportGetResponse.self
        )
    }
}