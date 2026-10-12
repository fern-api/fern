import Foundation
import Testing
import Api

@Suite("BClient Wire Tests") struct BClientWireTests {
    @Test func foo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.a.b.foo(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}