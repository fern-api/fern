import Foundation
import Testing
import MyCustomModule

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func listresources1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "description": "description",
                    "created_at": "2024-01-15T09:30:00Z",
                    "updated_at": "2024-01-15T09:30:00Z",
                    "metadata": {
                      "key": "value"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Resource(
                id: "id",
                name: "name",
                description: Optional(Nullable<String>.value("description")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "key": JSONValue.string("value")
                ]))
            )
        ]
        let response = try await client.service.listresources(
            page: 1,
            perPage: 1,
            sort: "sort",
            order: "order",
            includeTotals: true,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listresources2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "description": "description",
                    "created_at": "2024-01-15T09:30:00Z",
                    "updated_at": "2024-01-15T09:30:00Z",
                    "metadata": {
                      "metadata": {
                        "key": "value"
                      }
                    }
                  },
                  {
                    "id": "id",
                    "name": "name",
                    "description": "description",
                    "created_at": "2024-01-15T09:30:00Z",
                    "updated_at": "2024-01-15T09:30:00Z",
                    "metadata": {
                      "metadata": {
                        "key": "value"
                      }
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Resource(
                id: "id",
                name: "name",
                description: Optional(Nullable<String>.value("description")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            ),
            Resource(
                id: "id",
                name: "name",
                description: Optional(Nullable<String>.value("description")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            )
        ]
        let response = try await client.service.listresources(
            page: 1,
            perPage: 1,
            sort: "sort",
            order: "order",
            includeTotals: true,
            fields: .value("fields"),
            search: .value("search"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getresource1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "description": "description",
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "metadata": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Resource(
            id: "id",
            name: "name",
            description: Optional(Nullable<String>.value("description")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            metadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ]))
        )
        let response = try await client.service.getresource(
            resourceId: "resourceId",
            includeMetadata: true,
            format: "format",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getresource2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "description": "description",
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "metadata": {
                    "metadata": {
                      "key": "value"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Resource(
            id: "id",
            name: "name",
            description: Optional(Nullable<String>.value("description")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            metadata: Optional(Nullable<[String: JSONValue]>.value([
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]))
        )
        let response = try await client.service.getresource(
            resourceId: "resourceId",
            includeMetadata: true,
            format: "format",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchresources1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "results": [
                    {
                      "id": "id",
                      "name": "name",
                      "description": "description",
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "metadata": {
                        "key": "value"
                      }
                    }
                  ],
                  "total": 1,
                  "next_offset": 1
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = SearchResponse(
            results: [
                Resource(
                    id: "id",
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    metadata: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ]))
                )
            ],
            total: Optional(Nullable<Int>.value(1)),
            nextOffset: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.service.searchresources(
            limit: 1,
            offset: 1,
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchresources2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "results": [
                    {
                      "id": "id",
                      "name": "name",
                      "description": "description",
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "metadata": {
                        "metadata": {
                          "key": "value"
                        }
                      }
                    },
                    {
                      "id": "id",
                      "name": "name",
                      "description": "description",
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "metadata": {
                        "metadata": {
                          "key": "value"
                        }
                      }
                    }
                  ],
                  "total": 1,
                  "next_offset": 1
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = SearchResponse(
            results: [
                Resource(
                    id: "id",
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    metadata: Optional(Nullable<[String: JSONValue]>.value([
                        "metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]))
                ),
                Resource(
                    id: "id",
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    metadata: Optional(Nullable<[String: JSONValue]>.value([
                        "metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]))
                )
            ],
            total: Optional(Nullable<Int>.value(1)),
            nextOffset: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.service.searchresources(
            limit: 1,
            offset: 1,
            request: .init(
                query: .value("query"),
                filters: .value([
                    "filters": .object([
                        "key": .string("value")
                    ])
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listusers1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "users": [
                    {
                      "user_id": "user_id",
                      "email": "email",
                      "email_verified": true,
                      "username": "username",
                      "phone_number": "phone_number",
                      "phone_verified": true,
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "identities": [
                        {
                          "connection": "connection",
                          "user_id": "user_id",
                          "provider": "provider",
                          "is_social": true
                        }
                      ],
                      "app_metadata": {
                        "key": "value"
                      },
                      "user_metadata": {
                        "key": "value"
                      },
                      "picture": "picture",
                      "name": "name",
                      "nickname": "nickname",
                      "multifactor": [
                        "multifactor"
                      ],
                      "last_ip": "last_ip",
                      "last_login": "2024-01-15T09:30:00Z",
                      "logins_count": 1,
                      "blocked": true,
                      "given_name": "given_name",
                      "family_name": "family_name"
                    }
                  ],
                  "start": 1,
                  "limit": 1,
                  "length": 1,
                  "total": 1
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedUserResponse(
            users: [
                User(
                    userId: "user_id",
                    email: "email",
                    emailVerified: true,
                    username: Optional(Nullable<String>.value("username")),
                    phoneNumber: Optional(Nullable<String>.value("phone_number")),
                    phoneVerified: Optional(Nullable<Bool>.value(true)),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    identities: Optional(Nullable<[Identity]>.value([
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true
                        )
                    ])),
                    appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    picture: Optional(Nullable<String>.value("picture")),
                    name: Optional(Nullable<String>.value("name")),
                    nickname: Optional(Nullable<String>.value("nickname")),
                    multifactor: Optional(Nullable<[String]>.value([
                        "multifactor"
                    ])),
                    lastIp: Optional(Nullable<String>.value("last_ip")),
                    lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                    loginsCount: Optional(Nullable<Int>.value(1)),
                    blocked: Optional(Nullable<Bool>.value(true)),
                    givenName: Optional(Nullable<String>.value("given_name")),
                    familyName: Optional(Nullable<String>.value("family_name"))
                )
            ],
            start: 1,
            limit: 1,
            length: 1,
            total: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.service.listusers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listusers2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "users": [
                    {
                      "user_id": "user_id",
                      "email": "email",
                      "email_verified": true,
                      "username": "username",
                      "phone_number": "phone_number",
                      "phone_verified": true,
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "identities": [
                        {
                          "connection": "connection",
                          "user_id": "user_id",
                          "provider": "provider",
                          "is_social": true,
                          "access_token": "access_token",
                          "expires_in": 1
                        },
                        {
                          "connection": "connection",
                          "user_id": "user_id",
                          "provider": "provider",
                          "is_social": true,
                          "access_token": "access_token",
                          "expires_in": 1
                        }
                      ],
                      "app_metadata": {
                        "app_metadata": {
                          "key": "value"
                        }
                      },
                      "user_metadata": {
                        "user_metadata": {
                          "key": "value"
                        }
                      },
                      "picture": "picture",
                      "name": "name",
                      "nickname": "nickname",
                      "multifactor": [
                        "multifactor",
                        "multifactor"
                      ],
                      "last_ip": "last_ip",
                      "last_login": "2024-01-15T09:30:00Z",
                      "logins_count": 1,
                      "blocked": true,
                      "given_name": "given_name",
                      "family_name": "family_name"
                    },
                    {
                      "user_id": "user_id",
                      "email": "email",
                      "email_verified": true,
                      "username": "username",
                      "phone_number": "phone_number",
                      "phone_verified": true,
                      "created_at": "2024-01-15T09:30:00Z",
                      "updated_at": "2024-01-15T09:30:00Z",
                      "identities": [
                        {
                          "connection": "connection",
                          "user_id": "user_id",
                          "provider": "provider",
                          "is_social": true,
                          "access_token": "access_token",
                          "expires_in": 1
                        },
                        {
                          "connection": "connection",
                          "user_id": "user_id",
                          "provider": "provider",
                          "is_social": true,
                          "access_token": "access_token",
                          "expires_in": 1
                        }
                      ],
                      "app_metadata": {
                        "app_metadata": {
                          "key": "value"
                        }
                      },
                      "user_metadata": {
                        "user_metadata": {
                          "key": "value"
                        }
                      },
                      "picture": "picture",
                      "name": "name",
                      "nickname": "nickname",
                      "multifactor": [
                        "multifactor",
                        "multifactor"
                      ],
                      "last_ip": "last_ip",
                      "last_login": "2024-01-15T09:30:00Z",
                      "logins_count": 1,
                      "blocked": true,
                      "given_name": "given_name",
                      "family_name": "family_name"
                    }
                  ],
                  "start": 1,
                  "limit": 1,
                  "length": 1,
                  "total": 1
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedUserResponse(
            users: [
                User(
                    userId: "user_id",
                    email: "email",
                    emailVerified: true,
                    username: Optional(Nullable<String>.value("username")),
                    phoneNumber: Optional(Nullable<String>.value("phone_number")),
                    phoneVerified: Optional(Nullable<Bool>.value(true)),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    identities: Optional(Nullable<[Identity]>.value([
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional(Nullable<String>.value("access_token")),
                            expiresIn: Optional(Nullable<Int>.value(1))
                        ),
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional(Nullable<String>.value("access_token")),
                            expiresIn: Optional(Nullable<Int>.value(1))
                        )
                    ])),
                    appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "app_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "user_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    picture: Optional(Nullable<String>.value("picture")),
                    name: Optional(Nullable<String>.value("name")),
                    nickname: Optional(Nullable<String>.value("nickname")),
                    multifactor: Optional(Nullable<[String]>.value([
                        "multifactor",
                        "multifactor"
                    ])),
                    lastIp: Optional(Nullable<String>.value("last_ip")),
                    lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                    loginsCount: Optional(Nullable<Int>.value(1)),
                    blocked: Optional(Nullable<Bool>.value(true)),
                    givenName: Optional(Nullable<String>.value("given_name")),
                    familyName: Optional(Nullable<String>.value("family_name"))
                ),
                User(
                    userId: "user_id",
                    email: "email",
                    emailVerified: true,
                    username: Optional(Nullable<String>.value("username")),
                    phoneNumber: Optional(Nullable<String>.value("phone_number")),
                    phoneVerified: Optional(Nullable<Bool>.value(true)),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    identities: Optional(Nullable<[Identity]>.value([
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional(Nullable<String>.value("access_token")),
                            expiresIn: Optional(Nullable<Int>.value(1))
                        ),
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional(Nullable<String>.value("access_token")),
                            expiresIn: Optional(Nullable<Int>.value(1))
                        )
                    ])),
                    appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "app_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "user_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    picture: Optional(Nullable<String>.value("picture")),
                    name: Optional(Nullable<String>.value("name")),
                    nickname: Optional(Nullable<String>.value("nickname")),
                    multifactor: Optional(Nullable<[String]>.value([
                        "multifactor",
                        "multifactor"
                    ])),
                    lastIp: Optional(Nullable<String>.value("last_ip")),
                    lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                    loginsCount: Optional(Nullable<Int>.value(1)),
                    blocked: Optional(Nullable<Bool>.value(true)),
                    givenName: Optional(Nullable<String>.value("given_name")),
                    familyName: Optional(Nullable<String>.value("family_name"))
                )
            ],
            start: 1,
            limit: 1,
            length: 1,
            total: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.service.listusers(
            page: .value(1),
            perPage: .value(1),
            includeTotals: .value(true),
            sort: .value("sort"),
            connection: .value("connection"),
            q: .value("q"),
            searchEngine: .value("search_engine"),
            fields: .value("fields"),
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
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "key": "value"
                  },
                  "user_metadata": {
                    "key": "value"
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.createuser(
            request: .init(
                email: "email",
                connection: "connection"
            ),
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
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    },
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "app_metadata": {
                      "key": "value"
                    }
                  },
                  "user_metadata": {
                    "user_metadata": {
                      "key": "value"
                    }
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor",
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor",
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.createuser(
            request: .init(
                email: "email",
                emailVerified: .value(true),
                username: .value("username"),
                password: .value("password"),
                phoneNumber: .value("phone_number"),
                phoneVerified: .value(true),
                userMetadata: .value([
                    "user_metadata": .object([
                        "key": .string("value")
                    ])
                ]),
                appMetadata: .value([
                    "app_metadata": .object([
                        "key": .string("value")
                    ])
                ]),
                connection: "connection"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getuserbyid1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "key": "value"
                  },
                  "user_metadata": {
                    "key": "value"
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.getuserbyid(
            userId: "userId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getuserbyid2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    },
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "app_metadata": {
                      "key": "value"
                    }
                  },
                  "user_metadata": {
                    "user_metadata": {
                      "key": "value"
                    }
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor",
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor",
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.getuserbyid(
            userId: "userId",
            fields: .value("fields"),
            includeFields: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateuser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "key": "value"
                  },
                  "user_metadata": {
                    "key": "value"
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.updateuser(
            userId: "userId",
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateuser2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00Z",
                  "updated_at": "2024-01-15T09:30:00Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    },
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "app_metadata": {
                      "key": "value"
                    }
                  },
                  "user_metadata": {
                    "user_metadata": {
                      "key": "value"
                    }
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor",
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            userId: "user_id",
            email: "email",
            emailVerified: true,
            username: Optional(Nullable<String>.value("username")),
            phoneNumber: Optional(Nullable<String>.value("phone_number")),
            phoneVerified: Optional(Nullable<Bool>.value(true)),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional(Nullable<[Identity]>.value([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional(Nullable<String>.value("access_token")),
                    expiresIn: Optional(Nullable<Int>.value(1))
                )
            ])),
            appMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            userMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            picture: Optional(Nullable<String>.value("picture")),
            name: Optional(Nullable<String>.value("name")),
            nickname: Optional(Nullable<String>.value("nickname")),
            multifactor: Optional(Nullable<[String]>.value([
                "multifactor",
                "multifactor"
            ])),
            lastIp: Optional(Nullable<String>.value("last_ip")),
            lastLogin: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            loginsCount: Optional(Nullable<Int>.value(1)),
            blocked: Optional(Nullable<Bool>.value(true)),
            givenName: Optional(Nullable<String>.value("given_name")),
            familyName: Optional(Nullable<String>.value("family_name"))
        )
        let response = try await client.service.updateuser(
            userId: "userId",
            request: .init(
                email: .value("email"),
                emailVerified: .value(true),
                username: .value("username"),
                phoneNumber: .value("phone_number"),
                phoneVerified: .value(true),
                userMetadata: .value([
                    "user_metadata": .object([
                        "key": .string("value")
                    ])
                ]),
                appMetadata: .value([
                    "app_metadata": .object([
                        "key": .string("value")
                    ])
                ]),
                password: .value("password"),
                blocked: .value(true)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listconnections1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "display_name": "display_name",
                    "strategy": "strategy",
                    "options": {
                      "key": "value"
                    },
                    "enabled_clients": [
                      "enabled_clients"
                    ],
                    "realms": [
                      "realms"
                    ],
                    "is_domain_connection": true,
                    "metadata": {
                      "key": "value"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Connection(
                id: "id",
                name: "name",
                displayName: Optional(Nullable<String>.value("display_name")),
                strategy: "strategy",
                options: Optional(Nullable<[String: JSONValue]>.value([
                    "key": JSONValue.string("value")
                ])),
                enabledClients: Optional(Nullable<[String]>.value([
                    "enabled_clients"
                ])),
                realms: Optional(Nullable<[String]>.value([
                    "realms"
                ])),
                isDomainConnection: Optional(Nullable<Bool>.value(true)),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "key": JSONValue.string("value")
                ]))
            )
        ]
        let response = try await client.service.listconnections(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listconnections2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "display_name": "display_name",
                    "strategy": "strategy",
                    "options": {
                      "options": {
                        "key": "value"
                      }
                    },
                    "enabled_clients": [
                      "enabled_clients",
                      "enabled_clients"
                    ],
                    "realms": [
                      "realms",
                      "realms"
                    ],
                    "is_domain_connection": true,
                    "metadata": {
                      "metadata": {
                        "key": "value"
                      }
                    }
                  },
                  {
                    "id": "id",
                    "name": "name",
                    "display_name": "display_name",
                    "strategy": "strategy",
                    "options": {
                      "options": {
                        "key": "value"
                      }
                    },
                    "enabled_clients": [
                      "enabled_clients",
                      "enabled_clients"
                    ],
                    "realms": [
                      "realms",
                      "realms"
                    ],
                    "is_domain_connection": true,
                    "metadata": {
                      "metadata": {
                        "key": "value"
                      }
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Connection(
                id: "id",
                name: "name",
                displayName: Optional(Nullable<String>.value("display_name")),
                strategy: "strategy",
                options: Optional(Nullable<[String: JSONValue]>.value([
                    "options": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])),
                enabledClients: Optional(Nullable<[String]>.value([
                    "enabled_clients",
                    "enabled_clients"
                ])),
                realms: Optional(Nullable<[String]>.value([
                    "realms",
                    "realms"
                ])),
                isDomainConnection: Optional(Nullable<Bool>.value(true)),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            ),
            Connection(
                id: "id",
                name: "name",
                displayName: Optional(Nullable<String>.value("display_name")),
                strategy: "strategy",
                options: Optional(Nullable<[String: JSONValue]>.value([
                    "options": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])),
                enabledClients: Optional(Nullable<[String]>.value([
                    "enabled_clients",
                    "enabled_clients"
                ])),
                realms: Optional(Nullable<[String]>.value([
                    "realms",
                    "realms"
                ])),
                isDomainConnection: Optional(Nullable<Bool>.value(true)),
                metadata: Optional(Nullable<[String: JSONValue]>.value([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]))
            )
        ]
        let response = try await client.service.listconnections(
            strategy: .value("strategy"),
            name: .value("name"),
            fields: .value("fields"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getconnection1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "display_name": "display_name",
                  "strategy": "strategy",
                  "options": {
                    "key": "value"
                  },
                  "enabled_clients": [
                    "enabled_clients"
                  ],
                  "realms": [
                    "realms"
                  ],
                  "is_domain_connection": true,
                  "metadata": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Connection(
            id: "id",
            name: "name",
            displayName: Optional(Nullable<String>.value("display_name")),
            strategy: "strategy",
            options: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            enabledClients: Optional(Nullable<[String]>.value([
                "enabled_clients"
            ])),
            realms: Optional(Nullable<[String]>.value([
                "realms"
            ])),
            isDomainConnection: Optional(Nullable<Bool>.value(true)),
            metadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ]))
        )
        let response = try await client.service.getconnection(
            connectionId: "connectionId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getconnection2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "display_name": "display_name",
                  "strategy": "strategy",
                  "options": {
                    "options": {
                      "key": "value"
                    }
                  },
                  "enabled_clients": [
                    "enabled_clients",
                    "enabled_clients"
                  ],
                  "realms": [
                    "realms",
                    "realms"
                  ],
                  "is_domain_connection": true,
                  "metadata": {
                    "metadata": {
                      "key": "value"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Connection(
            id: "id",
            name: "name",
            displayName: Optional(Nullable<String>.value("display_name")),
            strategy: "strategy",
            options: Optional(Nullable<[String: JSONValue]>.value([
                "options": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            enabledClients: Optional(Nullable<[String]>.value([
                "enabled_clients",
                "enabled_clients"
            ])),
            realms: Optional(Nullable<[String]>.value([
                "realms",
                "realms"
            ])),
            isDomainConnection: Optional(Nullable<Bool>.value(true)),
            metadata: Optional(Nullable<[String: JSONValue]>.value([
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]))
        )
        let response = try await client.service.getconnection(
            connectionId: "connectionId",
            fields: .value("fields"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listclients1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "start": 1,
                  "limit": 1,
                  "length": 1,
                  "total": 1,
                  "clients": [
                    {
                      "client_id": "client_id",
                      "tenant": "tenant",
                      "name": "name",
                      "description": "description",
                      "global": true,
                      "client_secret": "client_secret",
                      "app_type": "app_type",
                      "logo_uri": "logo_uri",
                      "is_first_party": true,
                      "oidc_conformant": true,
                      "callbacks": [
                        "callbacks"
                      ],
                      "allowed_origins": [
                        "allowed_origins"
                      ],
                      "web_origins": [
                        "web_origins"
                      ],
                      "grant_types": [
                        "grant_types"
                      ],
                      "jwt_configuration": {
                        "key": "value"
                      },
                      "signing_keys": [
                        {
                          "key": "value"
                        }
                      ],
                      "encryption_key": {
                        "key": "value"
                      },
                      "sso": true,
                      "sso_disabled": true,
                      "cross_origin_auth": true,
                      "cross_origin_loc": "cross_origin_loc",
                      "custom_login_page_on": true,
                      "custom_login_page": "custom_login_page",
                      "custom_login_page_preview": "custom_login_page_preview",
                      "form_template": "form_template",
                      "is_heroku_app": true,
                      "addons": {
                        "key": "value"
                      },
                      "token_endpoint_auth_method": "token_endpoint_auth_method",
                      "client_metadata": {
                        "key": "value"
                      },
                      "mobile": {
                        "key": "value"
                      }
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedClientResponse(
            start: 1,
            limit: 1,
            length: 1,
            total: Optional(Nullable<Int>.value(1)),
            clients: [
                Client(
                    clientId: "client_id",
                    tenant: Optional(Nullable<String>.value("tenant")),
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    global: Optional(Nullable<Bool>.value(true)),
                    clientSecret: Optional(Nullable<String>.value("client_secret")),
                    appType: Optional(Nullable<String>.value("app_type")),
                    logoUri: Optional(Nullable<String>.value("logo_uri")),
                    isFirstParty: Optional(Nullable<Bool>.value(true)),
                    oidcConformant: Optional(Nullable<Bool>.value(true)),
                    callbacks: Optional(Nullable<[String]>.value([
                        "callbacks"
                    ])),
                    allowedOrigins: Optional(Nullable<[String]>.value([
                        "allowed_origins"
                    ])),
                    webOrigins: Optional(Nullable<[String]>.value([
                        "web_origins"
                    ])),
                    grantTypes: Optional(Nullable<[String]>.value([
                        "grant_types"
                    ])),
                    jwtConfiguration: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    signingKeys: Optional(Nullable<[[String: JSONValue]]>.value([
                        [
                            "key": JSONValue.string("value")
                        ]
                    ])),
                    encryptionKey: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    sso: Optional(Nullable<Bool>.value(true)),
                    ssoDisabled: Optional(Nullable<Bool>.value(true)),
                    crossOriginAuth: Optional(Nullable<Bool>.value(true)),
                    crossOriginLoc: Optional(Nullable<String>.value("cross_origin_loc")),
                    customLoginPageOn: Optional(Nullable<Bool>.value(true)),
                    customLoginPage: Optional(Nullable<String>.value("custom_login_page")),
                    customLoginPagePreview: Optional(Nullable<String>.value("custom_login_page_preview")),
                    formTemplate: Optional(Nullable<String>.value("form_template")),
                    isHerokuApp: Optional(Nullable<Bool>.value(true)),
                    addons: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    tokenEndpointAuthMethod: Optional(Nullable<String>.value("token_endpoint_auth_method")),
                    clientMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ])),
                    mobile: Optional(Nullable<[String: JSONValue]>.value([
                        "key": JSONValue.string("value")
                    ]))
                )
            ]
        )
        let response = try await client.service.listclients(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listclients2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "start": 1,
                  "limit": 1,
                  "length": 1,
                  "total": 1,
                  "clients": [
                    {
                      "client_id": "client_id",
                      "tenant": "tenant",
                      "name": "name",
                      "description": "description",
                      "global": true,
                      "client_secret": "client_secret",
                      "app_type": "app_type",
                      "logo_uri": "logo_uri",
                      "is_first_party": true,
                      "oidc_conformant": true,
                      "callbacks": [
                        "callbacks",
                        "callbacks"
                      ],
                      "allowed_origins": [
                        "allowed_origins",
                        "allowed_origins"
                      ],
                      "web_origins": [
                        "web_origins",
                        "web_origins"
                      ],
                      "grant_types": [
                        "grant_types",
                        "grant_types"
                      ],
                      "jwt_configuration": {
                        "jwt_configuration": {
                          "key": "value"
                        }
                      },
                      "signing_keys": [
                        {
                          "signing_keys": {
                            "key": "value"
                          }
                        },
                        {
                          "signing_keys": {
                            "key": "value"
                          }
                        }
                      ],
                      "encryption_key": {
                        "encryption_key": {
                          "key": "value"
                        }
                      },
                      "sso": true,
                      "sso_disabled": true,
                      "cross_origin_auth": true,
                      "cross_origin_loc": "cross_origin_loc",
                      "custom_login_page_on": true,
                      "custom_login_page": "custom_login_page",
                      "custom_login_page_preview": "custom_login_page_preview",
                      "form_template": "form_template",
                      "is_heroku_app": true,
                      "addons": {
                        "addons": {
                          "key": "value"
                        }
                      },
                      "token_endpoint_auth_method": "token_endpoint_auth_method",
                      "client_metadata": {
                        "client_metadata": {
                          "key": "value"
                        }
                      },
                      "mobile": {
                        "mobile": {
                          "key": "value"
                        }
                      }
                    },
                    {
                      "client_id": "client_id",
                      "tenant": "tenant",
                      "name": "name",
                      "description": "description",
                      "global": true,
                      "client_secret": "client_secret",
                      "app_type": "app_type",
                      "logo_uri": "logo_uri",
                      "is_first_party": true,
                      "oidc_conformant": true,
                      "callbacks": [
                        "callbacks",
                        "callbacks"
                      ],
                      "allowed_origins": [
                        "allowed_origins",
                        "allowed_origins"
                      ],
                      "web_origins": [
                        "web_origins",
                        "web_origins"
                      ],
                      "grant_types": [
                        "grant_types",
                        "grant_types"
                      ],
                      "jwt_configuration": {
                        "jwt_configuration": {
                          "key": "value"
                        }
                      },
                      "signing_keys": [
                        {
                          "signing_keys": {
                            "key": "value"
                          }
                        },
                        {
                          "signing_keys": {
                            "key": "value"
                          }
                        }
                      ],
                      "encryption_key": {
                        "encryption_key": {
                          "key": "value"
                        }
                      },
                      "sso": true,
                      "sso_disabled": true,
                      "cross_origin_auth": true,
                      "cross_origin_loc": "cross_origin_loc",
                      "custom_login_page_on": true,
                      "custom_login_page": "custom_login_page",
                      "custom_login_page_preview": "custom_login_page_preview",
                      "form_template": "form_template",
                      "is_heroku_app": true,
                      "addons": {
                        "addons": {
                          "key": "value"
                        }
                      },
                      "token_endpoint_auth_method": "token_endpoint_auth_method",
                      "client_metadata": {
                        "client_metadata": {
                          "key": "value"
                        }
                      },
                      "mobile": {
                        "mobile": {
                          "key": "value"
                        }
                      }
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedClientResponse(
            start: 1,
            limit: 1,
            length: 1,
            total: Optional(Nullable<Int>.value(1)),
            clients: [
                Client(
                    clientId: "client_id",
                    tenant: Optional(Nullable<String>.value("tenant")),
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    global: Optional(Nullable<Bool>.value(true)),
                    clientSecret: Optional(Nullable<String>.value("client_secret")),
                    appType: Optional(Nullable<String>.value("app_type")),
                    logoUri: Optional(Nullable<String>.value("logo_uri")),
                    isFirstParty: Optional(Nullable<Bool>.value(true)),
                    oidcConformant: Optional(Nullable<Bool>.value(true)),
                    callbacks: Optional(Nullable<[String]>.value([
                        "callbacks",
                        "callbacks"
                    ])),
                    allowedOrigins: Optional(Nullable<[String]>.value([
                        "allowed_origins",
                        "allowed_origins"
                    ])),
                    webOrigins: Optional(Nullable<[String]>.value([
                        "web_origins",
                        "web_origins"
                    ])),
                    grantTypes: Optional(Nullable<[String]>.value([
                        "grant_types",
                        "grant_types"
                    ])),
                    jwtConfiguration: Optional(Nullable<[String: JSONValue]>.value([
                        "jwt_configuration": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    signingKeys: Optional(Nullable<[[String: JSONValue]]>.value([
                        [
                            "signing_keys": JSONValue.object(
                                [
                                    "key": JSONValue.string("value")
                                ]
                            )
                        ],
                        [
                            "signing_keys": JSONValue.object(
                                [
                                    "key": JSONValue.string("value")
                                ]
                            )
                        ]
                    ])),
                    encryptionKey: Optional(Nullable<[String: JSONValue]>.value([
                        "encryption_key": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    sso: Optional(Nullable<Bool>.value(true)),
                    ssoDisabled: Optional(Nullable<Bool>.value(true)),
                    crossOriginAuth: Optional(Nullable<Bool>.value(true)),
                    crossOriginLoc: Optional(Nullable<String>.value("cross_origin_loc")),
                    customLoginPageOn: Optional(Nullable<Bool>.value(true)),
                    customLoginPage: Optional(Nullable<String>.value("custom_login_page")),
                    customLoginPagePreview: Optional(Nullable<String>.value("custom_login_page_preview")),
                    formTemplate: Optional(Nullable<String>.value("form_template")),
                    isHerokuApp: Optional(Nullable<Bool>.value(true)),
                    addons: Optional(Nullable<[String: JSONValue]>.value([
                        "addons": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    tokenEndpointAuthMethod: Optional(Nullable<String>.value("token_endpoint_auth_method")),
                    clientMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "client_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    mobile: Optional(Nullable<[String: JSONValue]>.value([
                        "mobile": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]))
                ),
                Client(
                    clientId: "client_id",
                    tenant: Optional(Nullable<String>.value("tenant")),
                    name: "name",
                    description: Optional(Nullable<String>.value("description")),
                    global: Optional(Nullable<Bool>.value(true)),
                    clientSecret: Optional(Nullable<String>.value("client_secret")),
                    appType: Optional(Nullable<String>.value("app_type")),
                    logoUri: Optional(Nullable<String>.value("logo_uri")),
                    isFirstParty: Optional(Nullable<Bool>.value(true)),
                    oidcConformant: Optional(Nullable<Bool>.value(true)),
                    callbacks: Optional(Nullable<[String]>.value([
                        "callbacks",
                        "callbacks"
                    ])),
                    allowedOrigins: Optional(Nullable<[String]>.value([
                        "allowed_origins",
                        "allowed_origins"
                    ])),
                    webOrigins: Optional(Nullable<[String]>.value([
                        "web_origins",
                        "web_origins"
                    ])),
                    grantTypes: Optional(Nullable<[String]>.value([
                        "grant_types",
                        "grant_types"
                    ])),
                    jwtConfiguration: Optional(Nullable<[String: JSONValue]>.value([
                        "jwt_configuration": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    signingKeys: Optional(Nullable<[[String: JSONValue]]>.value([
                        [
                            "signing_keys": JSONValue.object(
                                [
                                    "key": JSONValue.string("value")
                                ]
                            )
                        ],
                        [
                            "signing_keys": JSONValue.object(
                                [
                                    "key": JSONValue.string("value")
                                ]
                            )
                        ]
                    ])),
                    encryptionKey: Optional(Nullable<[String: JSONValue]>.value([
                        "encryption_key": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    sso: Optional(Nullable<Bool>.value(true)),
                    ssoDisabled: Optional(Nullable<Bool>.value(true)),
                    crossOriginAuth: Optional(Nullable<Bool>.value(true)),
                    crossOriginLoc: Optional(Nullable<String>.value("cross_origin_loc")),
                    customLoginPageOn: Optional(Nullable<Bool>.value(true)),
                    customLoginPage: Optional(Nullable<String>.value("custom_login_page")),
                    customLoginPagePreview: Optional(Nullable<String>.value("custom_login_page_preview")),
                    formTemplate: Optional(Nullable<String>.value("form_template")),
                    isHerokuApp: Optional(Nullable<Bool>.value(true)),
                    addons: Optional(Nullable<[String: JSONValue]>.value([
                        "addons": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    tokenEndpointAuthMethod: Optional(Nullable<String>.value("token_endpoint_auth_method")),
                    clientMetadata: Optional(Nullable<[String: JSONValue]>.value([
                        "client_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])),
                    mobile: Optional(Nullable<[String: JSONValue]>.value([
                        "mobile": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]))
                )
            ]
        )
        let response = try await client.service.listclients(
            fields: .value("fields"),
            includeFields: .value(true),
            page: .value(1),
            perPage: .value(1),
            includeTotals: .value(true),
            isGlobal: .value(true),
            isFirstParty: .value(true),
            appType: .value([
                "app_type",
                "app_type"
            ]),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getclient1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "client_id": "client_id",
                  "tenant": "tenant",
                  "name": "name",
                  "description": "description",
                  "global": true,
                  "client_secret": "client_secret",
                  "app_type": "app_type",
                  "logo_uri": "logo_uri",
                  "is_first_party": true,
                  "oidc_conformant": true,
                  "callbacks": [
                    "callbacks"
                  ],
                  "allowed_origins": [
                    "allowed_origins"
                  ],
                  "web_origins": [
                    "web_origins"
                  ],
                  "grant_types": [
                    "grant_types"
                  ],
                  "jwt_configuration": {
                    "key": "value"
                  },
                  "signing_keys": [
                    {
                      "key": "value"
                    }
                  ],
                  "encryption_key": {
                    "key": "value"
                  },
                  "sso": true,
                  "sso_disabled": true,
                  "cross_origin_auth": true,
                  "cross_origin_loc": "cross_origin_loc",
                  "custom_login_page_on": true,
                  "custom_login_page": "custom_login_page",
                  "custom_login_page_preview": "custom_login_page_preview",
                  "form_template": "form_template",
                  "is_heroku_app": true,
                  "addons": {
                    "key": "value"
                  },
                  "token_endpoint_auth_method": "token_endpoint_auth_method",
                  "client_metadata": {
                    "key": "value"
                  },
                  "mobile": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Client(
            clientId: "client_id",
            tenant: Optional(Nullable<String>.value("tenant")),
            name: "name",
            description: Optional(Nullable<String>.value("description")),
            global: Optional(Nullable<Bool>.value(true)),
            clientSecret: Optional(Nullable<String>.value("client_secret")),
            appType: Optional(Nullable<String>.value("app_type")),
            logoUri: Optional(Nullable<String>.value("logo_uri")),
            isFirstParty: Optional(Nullable<Bool>.value(true)),
            oidcConformant: Optional(Nullable<Bool>.value(true)),
            callbacks: Optional(Nullable<[String]>.value([
                "callbacks"
            ])),
            allowedOrigins: Optional(Nullable<[String]>.value([
                "allowed_origins"
            ])),
            webOrigins: Optional(Nullable<[String]>.value([
                "web_origins"
            ])),
            grantTypes: Optional(Nullable<[String]>.value([
                "grant_types"
            ])),
            jwtConfiguration: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            signingKeys: Optional(Nullable<[[String: JSONValue]]>.value([
                [
                    "key": JSONValue.string("value")
                ]
            ])),
            encryptionKey: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            sso: Optional(Nullable<Bool>.value(true)),
            ssoDisabled: Optional(Nullable<Bool>.value(true)),
            crossOriginAuth: Optional(Nullable<Bool>.value(true)),
            crossOriginLoc: Optional(Nullable<String>.value("cross_origin_loc")),
            customLoginPageOn: Optional(Nullable<Bool>.value(true)),
            customLoginPage: Optional(Nullable<String>.value("custom_login_page")),
            customLoginPagePreview: Optional(Nullable<String>.value("custom_login_page_preview")),
            formTemplate: Optional(Nullable<String>.value("form_template")),
            isHerokuApp: Optional(Nullable<Bool>.value(true)),
            addons: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            tokenEndpointAuthMethod: Optional(Nullable<String>.value("token_endpoint_auth_method")),
            clientMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ])),
            mobile: Optional(Nullable<[String: JSONValue]>.value([
                "key": JSONValue.string("value")
            ]))
        )
        let response = try await client.service.getclient(
            clientId: "clientId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getclient2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "client_id": "client_id",
                  "tenant": "tenant",
                  "name": "name",
                  "description": "description",
                  "global": true,
                  "client_secret": "client_secret",
                  "app_type": "app_type",
                  "logo_uri": "logo_uri",
                  "is_first_party": true,
                  "oidc_conformant": true,
                  "callbacks": [
                    "callbacks",
                    "callbacks"
                  ],
                  "allowed_origins": [
                    "allowed_origins",
                    "allowed_origins"
                  ],
                  "web_origins": [
                    "web_origins",
                    "web_origins"
                  ],
                  "grant_types": [
                    "grant_types",
                    "grant_types"
                  ],
                  "jwt_configuration": {
                    "jwt_configuration": {
                      "key": "value"
                    }
                  },
                  "signing_keys": [
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    },
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    }
                  ],
                  "encryption_key": {
                    "encryption_key": {
                      "key": "value"
                    }
                  },
                  "sso": true,
                  "sso_disabled": true,
                  "cross_origin_auth": true,
                  "cross_origin_loc": "cross_origin_loc",
                  "custom_login_page_on": true,
                  "custom_login_page": "custom_login_page",
                  "custom_login_page_preview": "custom_login_page_preview",
                  "form_template": "form_template",
                  "is_heroku_app": true,
                  "addons": {
                    "addons": {
                      "key": "value"
                    }
                  },
                  "token_endpoint_auth_method": "token_endpoint_auth_method",
                  "client_metadata": {
                    "client_metadata": {
                      "key": "value"
                    }
                  },
                  "mobile": {
                    "mobile": {
                      "key": "value"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Client(
            clientId: "client_id",
            tenant: Optional(Nullable<String>.value("tenant")),
            name: "name",
            description: Optional(Nullable<String>.value("description")),
            global: Optional(Nullable<Bool>.value(true)),
            clientSecret: Optional(Nullable<String>.value("client_secret")),
            appType: Optional(Nullable<String>.value("app_type")),
            logoUri: Optional(Nullable<String>.value("logo_uri")),
            isFirstParty: Optional(Nullable<Bool>.value(true)),
            oidcConformant: Optional(Nullable<Bool>.value(true)),
            callbacks: Optional(Nullable<[String]>.value([
                "callbacks",
                "callbacks"
            ])),
            allowedOrigins: Optional(Nullable<[String]>.value([
                "allowed_origins",
                "allowed_origins"
            ])),
            webOrigins: Optional(Nullable<[String]>.value([
                "web_origins",
                "web_origins"
            ])),
            grantTypes: Optional(Nullable<[String]>.value([
                "grant_types",
                "grant_types"
            ])),
            jwtConfiguration: Optional(Nullable<[String: JSONValue]>.value([
                "jwt_configuration": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            signingKeys: Optional(Nullable<[[String: JSONValue]]>.value([
                [
                    "signing_keys": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ],
                [
                    "signing_keys": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]
            ])),
            encryptionKey: Optional(Nullable<[String: JSONValue]>.value([
                "encryption_key": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            sso: Optional(Nullable<Bool>.value(true)),
            ssoDisabled: Optional(Nullable<Bool>.value(true)),
            crossOriginAuth: Optional(Nullable<Bool>.value(true)),
            crossOriginLoc: Optional(Nullable<String>.value("cross_origin_loc")),
            customLoginPageOn: Optional(Nullable<Bool>.value(true)),
            customLoginPage: Optional(Nullable<String>.value("custom_login_page")),
            customLoginPagePreview: Optional(Nullable<String>.value("custom_login_page_preview")),
            formTemplate: Optional(Nullable<String>.value("form_template")),
            isHerokuApp: Optional(Nullable<Bool>.value(true)),
            addons: Optional(Nullable<[String: JSONValue]>.value([
                "addons": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            tokenEndpointAuthMethod: Optional(Nullable<String>.value("token_endpoint_auth_method")),
            clientMetadata: Optional(Nullable<[String: JSONValue]>.value([
                "client_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])),
            mobile: Optional(Nullable<[String: JSONValue]>.value([
                "mobile": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]))
        )
        let response = try await client.service.getclient(
            clientId: "clientId",
            fields: .value("fields"),
            includeFields: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}