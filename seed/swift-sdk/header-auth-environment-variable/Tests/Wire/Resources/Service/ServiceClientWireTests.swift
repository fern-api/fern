import Foundation
import Testing
import HeaderTokenEnvironmentVariable

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getWithBearerToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = HeaderTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            headerTokenAuth: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}