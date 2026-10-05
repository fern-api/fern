import Foundation
import Testing
import FileDownload

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func simple1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = FileDownloadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.simple(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}