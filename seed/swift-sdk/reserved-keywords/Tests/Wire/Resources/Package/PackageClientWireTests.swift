import Foundation
import Testing
import NurseryApi

@Suite("PackageClient Wire Tests") struct PackageClientWireTests {
    @Test func test1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}