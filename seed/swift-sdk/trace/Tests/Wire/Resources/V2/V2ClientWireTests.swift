import Foundation
import Testing
import Trace

@Suite("V2Client Wire Tests") struct V2ClientWireTests {
    @Test func test1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.v2.test(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}