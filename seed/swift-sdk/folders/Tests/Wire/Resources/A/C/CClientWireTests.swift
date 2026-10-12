import Foundation
import Testing
import Api

@Suite("CClient Wire Tests") struct CClientWireTests {
    @Test func foo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.a.c.foo(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}