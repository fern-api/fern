import Foundation
import Testing
import Api

@Suite("NullableClient Wire Tests") struct NullableClientWireTests {
    @Test func getusers1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "id": "id",
                    "tags": [
                      "tags"
                    ],
                    "metadata": {
                      "createdAt": "2024-01-15T09:30:00Z",
                      "updatedAt": "2024-01-15T09:30:00Z",
                      "avatar": "avatar",
                      "activated": true,
                      "status": {
                        "type": "active"
                      }
                    },
                    "email": "email",
                    "favorite-number": 1,
                    "numbers": [
                      1
                    ],
                    "strings": {
                      "key": "value"
                    }
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
                name: "name",
                id: "id",
                tags: Nullable<[String]>.value([
                    "tags"
                ]),
                metadata: Optional(Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: Nullable<String>.value("avatar"),
                    activated: Optional(Nullable<Bool>.value(true)),
                    status: Status.active(
                        .init(
                            additionalProperties: [
                                "type": JSONValue.string("active")
                            ]
                        )
                    )
                )),
                email: Nullable<Email>.value(Nullable<String>.value("email")),
                favoriteNumber: WeirdNumber.int(
                    1
                ),
                numbers: Optional(Nullable<[Int]>.value([
                    1
                ])),
                strings: Optional(Nullable<[String: JSONValue]>.value([
                    "key": JSONValue.string("value")
                ]))
            )
        ]
        let response = try await client.nullable.getusers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getusers2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                name: "name",
                id: "id",
                tags: Nullable<[String]>.value([
                    "tags",
                    "tags"
                ]),
                metadata: Optional(Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: Nullable<String>.value("avatar"),
                    activated: Optional(Nullable<Bool>.value(true)),
                    status: Status.active(
                        .init(
                            additionalProperties: [
                                "type": JSONValue.string("active")
                            ]
                        )
                    ),
                    values: Optional(Nullable<[String: Nullable<String>]>.value([
                        "values": Nullable<String>.value("values")
                    ]))
                )),
                email: Nullable<Email>.value(Nullable<String>.value("email")),
                favoriteNumber: WeirdNumber.int(
                    1
                ),
                numbers: Optional(Nullable<[Int]>.value([
                    1,
                    1
                ])),
                strings: Optional(Nullable<[String: JSONValue]>.value([
                    "strings": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            ),
            User(
                name: "name",
                id: "id",
                tags: Nullable<[String]>.value([
                    "tags",
                    "tags"
                ]),
                metadata: Optional(Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: Nullable<String>.value("avatar"),
                    activated: Optional(Nullable<Bool>.value(true)),
                    status: Status.active(
                        .init(
                            additionalProperties: [
                                "type": JSONValue.string("active")
                            ]
                        )
                    ),
                    values: Optional(Nullable<[String: Nullable<String>]>.value([
                        "values": Nullable<String>.value("values")
                    ]))
                )),
                email: Nullable<Email>.value(Nullable<String>.value("email")),
                favoriteNumber: WeirdNumber.int(
                    1
                ),
                numbers: Optional(Nullable<[Int]>.value([
                    1,
                    1
                ])),
                strings: Optional(Nullable<[String: JSONValue]>.value([
                    "strings": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            )
        ]
        let response = try await client.nullable.getusers(
            avatar: .value("avatar"),
            extra: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createuser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "id": "id",
                  "tags": [
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
                      "key": "value"
                    }
                  },
                  "email": "email",
                  "favorite-number": 1,
                  "numbers": [
                    1
                  ],
                  "strings": {
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
            name: "name",
            id: "id",
            tags: Nullable<[String]>.value([
                "tags"
            ]),
            metadata: Optional(Metadata(
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                avatar: Nullable<String>.value("avatar"),
                activated: Optional(Nullable<Bool>.value(true)),
                status: Status.active(
                    .init(
                        additionalProperties: [
                            "type": JSONValue.string("active")
                        ]
                    )
                ),
                values: Optional(Nullable<[String: Nullable<String>]>.value([
                    "key": Nullable<String>.value("value")
                ]))
            )),
            email: Nullable<Email>.value(Nullable<String>.value("email")),
            favoriteNumber: WeirdNumber.int(
                1
            ),
            numbers: Optional(Nullable<[Int]>.value([
                1
            ])),
            strings: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ]))
        )
        let response = try await client.nullable.createuser(
            request: .init(username: "username"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createuser2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            id: "id",
            tags: Nullable<[String]>.value([
                "tags",
                "tags"
            ]),
            metadata: Optional(Metadata(
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                avatar: Nullable<String>.value("avatar"),
                activated: Optional(Nullable<Bool>.value(true)),
                status: Status.active(
                    .init(
                        additionalProperties: [
                            "type": JSONValue.string("active")
                        ]
                    )
                ),
                values: Optional(Nullable<[String: Nullable<String>]>.value([
                    "values": Nullable<String>.value("values")
                ]))
            )),
            email: Nullable<Email>.value(Nullable<String>.value("email")),
            favoriteNumber: WeirdNumber.int(
                1
            ),
            numbers: Optional(Nullable<[Int]>.value([
                1,
                1
            ])),
            strings: Optional(Nullable<[String: JSONValue]>.value([
                "strings": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]))
        )
        let response = try await client.nullable.createuser(
            request: .init(
                username: "username",
                tags: .value([
                    "tags",
                    "tags"
                ]),
                metadata: Metadata(
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    avatar: .value("avatar"),
                    activated: .value(true),
                    status: Status.active(
                        StatusActive(

                        )
                    ),
                    values: .value([
                        "values": .value("values")
                    ])
                ),
                avatar: .value("avatar")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func deleteuser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.nullable.deleteuser(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func deleteuser2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.nullable.deleteuser(
            request: .init(username: .value("username")),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}