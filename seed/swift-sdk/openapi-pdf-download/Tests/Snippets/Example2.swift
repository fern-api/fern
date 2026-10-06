import Foundation
import Api

enum Example2 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.assetReport.get(request: AssetReportPdfGetRequest(
            assetReportToken: "asset_report_token"
        ))
    }
}
