import Foundation
import Testing
import Api

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "deleted_at": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            id: "id",
            name: "name",
            deletedAt: Nullable<JSONValue>.value(JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ))
        )
        let response = try await client.users.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "deleted_at": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            id: "id",
            name: "name",
            deletedAt: Nullable<JSONValue>.value(JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ))
        )
        let response = try await client.users.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}