import Foundation
import Testing
import Api

@Suite("ClientsClient Wire Tests") struct ClientsClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 201,
            body: Foundation.Data(
                #"""
                {
                  "client": {
                    "id": "client-123",
                    "name": "Acme Corp",
                    "email": "contact@acme.com"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ClientResponse(
            client: Optional(ClientWithId(
                id: "client-123",
                name: "Acme Corp",
                email: "contact@acme.com"
            ))
        )
        let response = try await client.clients.create(
            request: .init(client: Client(
                name: "Acme Corp",
                email: "contact@acme.com"
            )),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}