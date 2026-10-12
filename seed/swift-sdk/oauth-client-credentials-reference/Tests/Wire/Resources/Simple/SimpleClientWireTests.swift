import Foundation
import Testing
import OauthClientCredentialsReference

@Suite("SimpleClient Wire Tests") struct SimpleClientWireTests {
    @Test func getSomething1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = OauthClientCredentialsReferenceClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.simple.getSomething(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}