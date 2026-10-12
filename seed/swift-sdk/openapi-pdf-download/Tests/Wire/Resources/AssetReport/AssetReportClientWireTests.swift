import Foundation
import Testing
import Api

@Suite("AssetReportClient Wire Tests") struct AssetReportClientWireTests {
    @Test func getPdfThrowsBadRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.assetReport.getPdf(
                request: AssetReportPdfGetRequest(
                    assetReportToken: "asset_report_token"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 400")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message"
            }
            """#)
        }
    }

    @Test func getPdfThrowsInternalServerError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.assetReport.getPdf(
                request: AssetReportPdfGetRequest(
                    assetReportToken: "asset_report_token"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 500")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 500)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message"
            }
            """#)
        }
    }

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
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getThrowsBadRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.assetReport.get(
                request: AssetReportPdfGetRequest(
                    assetReportToken: "asset_report_token"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 400")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message"
            }
            """#)
        }
    }
}