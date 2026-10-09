import Foundation
import Testing
import ApiWideBasePath

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func post1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiWideBasePathClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.post(
            pathParam: "pathParam",
            serviceParam: "serviceParam",
            endpointParam: "1",
            resourceParam: "resourceParam",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}