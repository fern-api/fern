import Foundation
import Testing
import InferredAuthImplicit

@Suite("ApiClient Wire Tests") struct ApiClientWireTests {
    @Test func getSomething1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = InferredAuthImplicitClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.nestedNoAuth.api.getSomething(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}