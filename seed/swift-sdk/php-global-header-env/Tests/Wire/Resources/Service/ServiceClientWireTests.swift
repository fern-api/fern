import Foundation
import Testing
import PhpGlobalHeaderEnv

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getWithApiVersion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                string
                """#.utf8
            )
        )
        let client = PhpGlobalHeaderEnvClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getWithApiVersion(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}