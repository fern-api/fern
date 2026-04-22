import Foundation
import Testing
import MixedFileDirectory

@Suite("OrganizationClient Wire Tests") struct OrganizationClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "users": [
                    {
                      "id": "id",
                      "name": "name",
                      "age": 1
                    },
                    {
                      "id": "id",
                      "name": "name",
                      "age": 1
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = MixedFileDirectoryClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Organization(
            id: "id",
            name: "name",
            users: [
                User(
                    id: "id",
                    name: "name",
                    age: 1
                ),
                User(
                    id: "id",
                    name: "name",
                    age: 1
                )
            ]
        )
        let response = try await client.organization.create(
            request: CreateOrganizationRequest(
                name: "name"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}