import Foundation
import Testing
import Api

@Suite("V1Client Wire Tests") struct V1ClientWireTests {
    @Test func listUsers1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "id": "id",
                    "email": "email"
                  }
                ]
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-Api-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserV1(
                id: "id",
                email: Optional("email")
            )
        ]
        let response = try await client.v1.listUsers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listUsers2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "id": "id",
                    "email": "email"
                  },
                  {
                    "id": "id",
                    "email": "email"
                  }
                ]
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-Api-Key>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserV1(
                id: "id",
                email: Optional("email")
            ),
            UserV1(
                id: "id",
                email: Optional("email")
            )
        ]
        let response = try await client.v1.listUsers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}