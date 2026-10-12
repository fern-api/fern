import Foundation
import Testing
import Api

@Suite("ItemsClient Wire Tests") struct ItemsClientWireTests {
    @Test func listItems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                string
                """#.utf8
            )
        )
        let client = ApiClient(
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.items.listItems(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}