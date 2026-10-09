import Foundation
import Testing
import InferredAuthImplicitNoExpiry

@Suite("NestedApiClient Wire Tests") struct NestedApiClientWireTests {
    @Test func getSomething1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = InferredAuthImplicitNoExpiryClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.nested.api.getSomething(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}