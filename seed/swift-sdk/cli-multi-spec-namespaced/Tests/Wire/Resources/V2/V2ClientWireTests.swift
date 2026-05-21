import Foundation
import Testing
import Api

@Suite("V2Client Wire Tests") struct V2ClientWireTests {
    @Test func listUsers1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "id": "id",
                    "profile": {
                      "email": "email",
                      "displayName": "displayName"
                    }
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
            UserV2(
                id: "id",
                profile: UserV2Profile(
                    email: Optional("email"),
                    displayName: Optional("displayName")
                )
            )
        ]
        let response = try await client.v2.listUsers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
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
                    "profile": {
                      "email": "email",
                      "displayName": "displayName"
                    }
                  },
                  {
                    "id": "id",
                    "profile": {
                      "email": "email",
                      "displayName": "displayName"
                    }
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
            UserV2(
                id: "id",
                profile: UserV2Profile(
                    email: Optional("email"),
                    displayName: Optional("displayName")
                )
            ),
            UserV2(
                id: "id",
                profile: UserV2Profile(
                    email: Optional("email"),
                    displayName: Optional("displayName")
                )
            )
        ]
        let response = try await client.v2.listUsers(
            pageSize: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}