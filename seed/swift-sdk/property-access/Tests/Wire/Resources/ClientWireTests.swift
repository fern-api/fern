import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func createUser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "email": "email",
                  "password": "password",
                  "profile": {
                    "name": "name",
                    "verification": {
                      "verified": "verified"
                    },
                    "ssn": "ssn"
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
            email: "email",
            password: "password",
            profile: UserProfile(
                name: "name",
                verification: UserProfileVerification(
                    verified: "verified"
                ),
                ssn: "ssn"
            )
        )
        let response = try await client..createUser(
            request: User(
                id: "id",
                email: "email",
                password: "password",
                profile: UserProfile(
                    name: "name",
                    verification: UserProfileVerification(
                        verified: "verified"
                    ),
                    ssn: "ssn"
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createUser2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "email": "email",
                  "password": "password",
                  "profile": {
                    "name": "name",
                    "verification": {
                      "verified": "verified"
                    },
                    "ssn": "ssn"
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
            email: "email",
            password: "password",
            profile: UserProfile(
                name: "name",
                verification: UserProfileVerification(
                    verified: "verified"
                ),
                ssn: "ssn"
            )
        )
        let response = try await client..createUser(
            request: User(
                id: "id",
                email: "email",
                password: "password",
                profile: UserProfile(
                    name: "name",
                    verification: UserProfileVerification(
                        verified: "verified"
                    ),
                    ssn: "ssn"
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}