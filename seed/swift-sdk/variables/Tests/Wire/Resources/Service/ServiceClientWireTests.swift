import Foundation
import Testing
import Variables

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func post1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = VariablesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.post(
            endpointParam: "<endpointParam>",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}