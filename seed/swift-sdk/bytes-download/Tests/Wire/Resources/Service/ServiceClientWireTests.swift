import Foundation
import Testing
import BytesDownload

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func simple1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = BytesDownloadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.simple(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}