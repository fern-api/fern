import Foundation
import Testing
import NullableApi

@Suite("NullableClient_ Wire Tests") struct NullableClient_WireTests {
    @Test func getUsers1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "id": "id",
                    "tags": [
                      "tags",
                      "tags"
                    ],
                    "metadata": {
                      "createdAt": "2024-01-15T09:30:00Z",
                      "updatedAt": "2024-01-15T09:30:00Z",
                      "avatar": "avatar",
                      "activated": true,
                      "status": {
                        "type": "active"
                      },
                      "values": {
                        "values": "values"
                      }
                    },
                    "email": "email",
                    "favorite-number": 1,
                    "numbers": [
                      1,
                      1
                    ],
                    "strings": {
                      "strings": {
                        "key": "value"
                      }
                    }
                  },
                  {
                    "name": "name",
                    "id": "id",
                    "tags": [
                      "tags",
                      "tags"
                    ],
                    "metadata": {
                      "createdAt": "2024-01-15T09:30:00Z",
                      "updatedAt": "2024-01-15T09:30:00Z",
                      "avatar": "avatar",
                      "activated": true,
                      "status": {
                        "type": "active"
                      },
                      "values": {
                        "values": "values"
                      }
                    },
                    "email": "email",
                    "favorite-number": 1,
                    "numbers": [
                      1,
                      1
                    ],
                    "strings": {
                      "strings": {
                        "key": "value"
                      }
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = NullableClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                name: "name",
                id: "id",
                tags: Nullable.value([
                    "tags",
                    "tags"
                ]),
                metadata: Nullable.value(Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: Nullable.value("avatar"),
                    activated: Nullable.value(true),
                    status: .active(),
                    values: [
                        "values": Nullable.value("values")
                    ]
                )),
                email: Nullable.value("email"),
                favoriteNumber: WeirdNumber.int(
                    1
                ),
                numbers: Nullable.value([
                    1,
                    1
                ]),
                strings: Nullable.value([
                    "strings": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            ),
            User(
                name: "name",
                id: "id",
                tags: Nullable.value([
                    "tags",
                    "tags"
                ]),
                metadata: Nullable.value(Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: Nullable.value("avatar"),
                    activated: Nullable.value(true),
                    status: .active(),
                    values: [
                        "values": Nullable.value("values")
                    ]
                )),
                email: Nullable.value("email"),
                favoriteNumber: WeirdNumber.int(
                    1
                ),
                numbers: Nullable.value([
                    1,
                    1
                ]),
                strings: Nullable.value([
                    "strings": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            )
        ]
        let response = try await client.nullable.getUsers(
            usernames: ,
            avatar: "avatar",
            activated: ,
            tags: ,
            extra: .value(true)
        )
        try #require(response == expectedResponse)
    }

    @Test func createUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "id": "id",
                  "tags": [
                    "tags",
                    "tags"
                  ],
                  "metadata": {
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "avatar": "avatar",
                    "activated": true,
                    "status": {
                      "type": "active"
                    },
                    "values": {
                      "values": "values"
                    }
                  },
                  "email": "email",
                  "favorite-number": 1,
                  "numbers": [
                    1,
                    1
                  ],
                  "strings": {
                    "strings": {
                      "key": "value"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = NullableClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            id: "id",
            tags: Nullable.value([
                "tags",
                "tags"
            ]),
            metadata: Nullable.value(Metadata(
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                avatar: Nullable.value("avatar"),
                activated: Nullable.value(true),
                status: .active(),
                values: [
                    "values": Nullable.value("values")
                ]
            )),
            email: Nullable.value("email"),
            favoriteNumber: WeirdNumber.int(
                1
            ),
            numbers: Nullable.value([
                1,
                1
            ]),
            strings: Nullable.value([
                "strings": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])
        )
        let response = try await client.nullable.createUser(request: .init(
            username: "username",
            tags: [
                "tags",
                "tags"
            ],
            metadata: Metadata(
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                avatar: .value("avatar"),
                activated: .value(true),
                status: Status.active(
                    .init(

                    )
                ),
                values: [
                    "values": .value("values")
                ]
            ),
            avatar: .value("avatar")
        ))
        try #require(response == expectedResponse)
    }

    @Test func deleteUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = NullableClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.nullable.deleteUser(request: .init(username: .value("xy")))
        try #require(response == expectedResponse)
    }
}