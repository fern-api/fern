import Foundation
import Testing
import Enum

@Suite("HeadersClient Wire Tests") struct HeadersClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = EnumClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.headers.send(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}