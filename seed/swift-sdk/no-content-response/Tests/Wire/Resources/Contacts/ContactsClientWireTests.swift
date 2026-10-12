import Foundation
import Testing
import Api

@Suite("ContactsClient Wire Tests") struct ContactsClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "email": "email"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(Contact(
            id: "id",
            name: "name",
            email: Optional("email")
        ))
        let response = try await client.contacts.create(
            request: .init(name: "name"),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "email": "email"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Contact(
            id: "id",
            name: "name",
            email: Optional("email")
        )
        let response = try await client.contacts.get(
            id: "id",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}