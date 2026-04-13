import Foundation
import Testing
import Api

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func list1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "age": 1
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name",
                age: 1
            )
        ]
        let response = try await client.user.list(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func list2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
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
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
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
        let response = try await client.user.list(
            limit: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}