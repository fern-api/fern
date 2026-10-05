import Foundation
import Testing
import Api

@Suite("ReportingClient Wire Tests") struct ReportingClientWireTests {
    @Test func load1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.reporting.load(
            request: .init(),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}