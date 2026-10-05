import Foundation
import Testing
import RequestParameters

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func createUsername1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.user.createUsername(
            tags: [
                "tags",
                "tags"
            ],
            request: .init(
                username: "username",
                password: "password",
                name: "test"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func createUsernameWithReferencedType1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.user.createUsernameWithReferencedType(
            tags: [
                "tags",
                "tags"
            ],
            request: CreateUsernameBody(
                username: "username",
                password: "password",
                name: "test"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func createUsernameOptional1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.user.createUsernameOptional(
            request: .value(CreateUsernameBodyOptionalProperties(

            )),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func getUsername1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """#.utf8
            )
        )
        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.user.getUsername(
            limit: 1,
            id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            date: CalendarDate("2023-01-15")!,
            deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            bytes: "SGVsbG8gd29ybGQh",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            userList: [
                User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                ),
                User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                )
            ],
            optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            keyValue: [
                "keyValue": "keyValue"
            ],
            optionalString: "optionalString",
            nestedUser: NestedUser(
                name: "name",
                user: User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                )
            ),
            optionalUser: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            excludeUser: [
                User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                )
            ],
            filter: [
                "filter"
            ],
            longParam: 1000000,
            bigIntParam: "1000000",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}