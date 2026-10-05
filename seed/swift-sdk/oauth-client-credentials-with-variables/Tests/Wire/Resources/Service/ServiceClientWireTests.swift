import Foundation
import Testing
import OauthClientCredentialsWithVariables

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func post1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = OauthClientCredentialsWithVariablesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.post(
            endpointParam: "<endpointParam>",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}