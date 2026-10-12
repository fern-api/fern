import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.assetReport.getPdf(request: AssetReportPdfGetRequest(
            assetReportToken: "asset_report_token"
        ))
    }
}
