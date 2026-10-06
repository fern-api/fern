import Foundation
import Testing
import Api

@Suite("AssetReportClient Wire Tests") struct AssetReportClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = AssetReportGetResponse(
            requestId: "request_id"
        )
        let response = try await client.assetReport.get(
            request: AssetReportPdfGetRequest(
                assetReportToken: "asset_report_token"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = AssetReportGetResponse(
            requestId: "request_id"
        )
        let response = try await client.assetReport.get(
            request: AssetReportPdfGetRequest(
                assetReportToken: "asset_report_token"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}