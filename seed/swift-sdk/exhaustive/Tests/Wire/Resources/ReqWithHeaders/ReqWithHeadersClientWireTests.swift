import Foundation
import Testing
import Exhaustive

@Suite("ReqWithHeadersClient Wire Tests") struct ReqWithHeadersClientWireTests {
    @Test func getWithCustomHeader1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.reqWithHeaders.getWithCustomHeader(
            xTestServiceHeader: "X-TEST-SERVICE-HEADER",
            xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
            request: "string",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}