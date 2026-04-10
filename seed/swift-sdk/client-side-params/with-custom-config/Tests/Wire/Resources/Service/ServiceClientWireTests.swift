import Foundation
import Testing
import MyCustomModule

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func listResources1() async throws -> Void {
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
                description: Optional("description"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                metadata: Optional([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            ),
            Resource(
                id: "id",
                name: "name",
                description: Optional("description"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                metadata: Optional([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            )
        ]
        let response = try await client.service.listResources(
            page: 1,
            perPage: 1,
            sort: "created_at",
            order: "desc",
            includeTotals: true,
            fields: "fields",
            search: "search",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getResource1() async throws -> Void {
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
            description: Optional("description"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            metadata: Optional([
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])
        )
        let response = try await client.service.getResource(
            resourceId: "resourceId",
            includeMetadata: true,
            format: "json",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchResources1() async throws -> Void {
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
                    description: Optional("description"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    metadata: Optional([
                        "metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])
                ),
                Resource(
                    id: "id",
                    name: "name",
                    description: Optional("description"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    metadata: Optional([
                        "metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])
                )
            ],
            total: Optional(1),
            nextOffset: Optional(1)
        )
        let response = try await client.service.searchResources(
            limit: 1,
            offset: 1,
            request: .init(
                query: "query",
                filters: [
                    "filters": .object([
                        "key": .string("value")
                    ])
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listUsers1() async throws -> Void {
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
                    username: Optional("username"),
                    phoneNumber: Optional("phone_number"),
                    phoneVerified: Optional(true),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    identities: Optional([
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional("access_token"),
                            expiresIn: Optional(1)
                        ),
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional("access_token"),
                            expiresIn: Optional(1)
                        )
                    ]),
                    appMetadata: Optional([
                        "app_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    userMetadata: Optional([
                        "user_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    picture: Optional("picture"),
                    name: Optional("name"),
                    nickname: Optional("nickname"),
                    multifactor: Optional([
                        "multifactor",
                        "multifactor"
                    ]),
                    lastIp: Optional("last_ip"),
                    lastLogin: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    loginsCount: Optional(1),
                    blocked: Optional(true),
                    givenName: Optional("given_name"),
                    familyName: Optional("family_name")
                ),
                User(
                    userId: "user_id",
                    email: "email",
                    emailVerified: true,
                    username: Optional("username"),
                    phoneNumber: Optional("phone_number"),
                    phoneVerified: Optional(true),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    identities: Optional([
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional("access_token"),
                            expiresIn: Optional(1)
                        ),
                        Identity(
                            connection: "connection",
                            userId: "user_id",
                            provider: "provider",
                            isSocial: true,
                            accessToken: Optional("access_token"),
                            expiresIn: Optional(1)
                        )
                    ]),
                    appMetadata: Optional([
                        "app_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    userMetadata: Optional([
                        "user_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    picture: Optional("picture"),
                    name: Optional("name"),
                    nickname: Optional("nickname"),
                    multifactor: Optional([
                        "multifactor",
                        "multifactor"
                    ]),
                    lastIp: Optional("last_ip"),
                    lastLogin: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    loginsCount: Optional(1),
                    blocked: Optional(true),
                    givenName: Optional("given_name"),
                    familyName: Optional("family_name")
                )
            ],
            start: 1,
            limit: 1,
            length: 1,
            total: Optional(1)
        )
        let response = try await client.service.listUsers(
            page: 1,
            perPage: 1,
            includeTotals: true,
            sort: "sort",
            connection: "connection",
            q: "q",
            searchEngine: "search_engine",
            fields: "fields",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getUserById1() async throws -> Void {
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
            username: Optional("username"),
            phoneNumber: Optional("phone_number"),
            phoneVerified: Optional(true),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                )
            ]),
            appMetadata: Optional([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            userMetadata: Optional([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            picture: Optional("picture"),
            name: Optional("name"),
            nickname: Optional("nickname"),
            multifactor: Optional([
                "multifactor",
                "multifactor"
            ]),
            lastIp: Optional("last_ip"),
            lastLogin: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            loginsCount: Optional(1),
            blocked: Optional(true),
            givenName: Optional("given_name"),
            familyName: Optional("family_name")
        )
        let response = try await client.service.getUserById(
            userId: "userId",
            fields: "fields",
            includeFields: true,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createUser1() async throws -> Void {
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
            username: Optional("username"),
            phoneNumber: Optional("phone_number"),
            phoneVerified: Optional(true),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                )
            ]),
            appMetadata: Optional([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            userMetadata: Optional([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            picture: Optional("picture"),
            name: Optional("name"),
            nickname: Optional("nickname"),
            multifactor: Optional([
                "multifactor",
                "multifactor"
            ]),
            lastIp: Optional("last_ip"),
            lastLogin: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            loginsCount: Optional(1),
            blocked: Optional(true),
            givenName: Optional("given_name"),
            familyName: Optional("family_name")
        )
        let response = try await client.service.createUser(
            request: CreateUserRequest(
                email: "email",
                emailVerified: true,
                username: "username",
                password: "password",
                phoneNumber: "phone_number",
                phoneVerified: true,
                userMetadata: [
                    "user_metadata": .object([
                        "key": .string("value")
                    ])
                ],
                appMetadata: [
                    "app_metadata": .object([
                        "key": .string("value")
                    ])
                ],
                connection: "connection"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateUser1() async throws -> Void {
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
            username: Optional("username"),
            phoneNumber: Optional("phone_number"),
            phoneVerified: Optional(true),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            identities: Optional([
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                ),
                Identity(
                    connection: "connection",
                    userId: "user_id",
                    provider: "provider",
                    isSocial: true,
                    accessToken: Optional("access_token"),
                    expiresIn: Optional(1)
                )
            ]),
            appMetadata: Optional([
                "app_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            userMetadata: Optional([
                "user_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            picture: Optional("picture"),
            name: Optional("name"),
            nickname: Optional("nickname"),
            multifactor: Optional([
                "multifactor",
                "multifactor"
            ]),
            lastIp: Optional("last_ip"),
            lastLogin: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            loginsCount: Optional(1),
            blocked: Optional(true),
            givenName: Optional("given_name"),
            familyName: Optional("family_name")
        )
        let response = try await client.service.updateUser(
            userId: "userId",
            request: UpdateUserRequest(
                email: "email",
                emailVerified: true,
                username: "username",
                phoneNumber: "phone_number",
                phoneVerified: true,
                userMetadata: [
                    "user_metadata": .object([
                        "key": .string("value")
                    ])
                ],
                appMetadata: [
                    "app_metadata": .object([
                        "key": .string("value")
                    ])
                ],
                password: "password",
                blocked: true
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listConnections1() async throws -> Void {
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
                displayName: Optional("display_name"),
                strategy: "strategy",
                options: Optional([
                    "options": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]),
                enabledClients: Optional([
                    "enabled_clients",
                    "enabled_clients"
                ]),
                realms: Optional([
                    "realms",
                    "realms"
                ]),
                isDomainConnection: Optional(true),
                metadata: Optional([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            ),
            Connection(
                id: "id",
                name: "name",
                displayName: Optional("display_name"),
                strategy: "strategy",
                options: Optional([
                    "options": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ]),
                enabledClients: Optional([
                    "enabled_clients",
                    "enabled_clients"
                ]),
                realms: Optional([
                    "realms",
                    "realms"
                ]),
                isDomainConnection: Optional(true),
                metadata: Optional([
                    "metadata": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])
            )
        ]
        let response = try await client.service.listConnections(
            strategy: "strategy",
            name: "name",
            fields: "fields",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getConnection1() async throws -> Void {
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
            displayName: Optional("display_name"),
            strategy: "strategy",
            options: Optional([
                "options": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            enabledClients: Optional([
                "enabled_clients",
                "enabled_clients"
            ]),
            realms: Optional([
                "realms",
                "realms"
            ]),
            isDomainConnection: Optional(true),
            metadata: Optional([
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])
        )
        let response = try await client.service.getConnection(
            connectionId: "connectionId",
            fields: "fields",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listClients1() async throws -> Void {
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
            total: Optional(1),
            clients: [
                Client(
                    clientId: "client_id",
                    tenant: Optional("tenant"),
                    name: "name",
                    description: Optional("description"),
                    global: Optional(true),
                    clientSecret: Optional("client_secret"),
                    appType: Optional("app_type"),
                    logoUri: Optional("logo_uri"),
                    isFirstParty: Optional(true),
                    oidcConformant: Optional(true),
                    callbacks: Optional([
                        "callbacks",
                        "callbacks"
                    ]),
                    allowedOrigins: Optional([
                        "allowed_origins",
                        "allowed_origins"
                    ]),
                    webOrigins: Optional([
                        "web_origins",
                        "web_origins"
                    ]),
                    grantTypes: Optional([
                        "grant_types",
                        "grant_types"
                    ]),
                    jwtConfiguration: Optional([
                        "jwt_configuration": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    signingKeys: Optional([
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
                    ]),
                    encryptionKey: Optional([
                        "encryption_key": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    sso: Optional(true),
                    ssoDisabled: Optional(true),
                    crossOriginAuth: Optional(true),
                    crossOriginLoc: Optional("cross_origin_loc"),
                    customLoginPageOn: Optional(true),
                    customLoginPage: Optional("custom_login_page"),
                    customLoginPagePreview: Optional("custom_login_page_preview"),
                    formTemplate: Optional("form_template"),
                    isHerokuApp: Optional(true),
                    addons: Optional([
                        "addons": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    tokenEndpointAuthMethod: Optional("token_endpoint_auth_method"),
                    clientMetadata: Optional([
                        "client_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    mobile: Optional([
                        "mobile": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])
                ),
                Client(
                    clientId: "client_id",
                    tenant: Optional("tenant"),
                    name: "name",
                    description: Optional("description"),
                    global: Optional(true),
                    clientSecret: Optional("client_secret"),
                    appType: Optional("app_type"),
                    logoUri: Optional("logo_uri"),
                    isFirstParty: Optional(true),
                    oidcConformant: Optional(true),
                    callbacks: Optional([
                        "callbacks",
                        "callbacks"
                    ]),
                    allowedOrigins: Optional([
                        "allowed_origins",
                        "allowed_origins"
                    ]),
                    webOrigins: Optional([
                        "web_origins",
                        "web_origins"
                    ]),
                    grantTypes: Optional([
                        "grant_types",
                        "grant_types"
                    ]),
                    jwtConfiguration: Optional([
                        "jwt_configuration": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    signingKeys: Optional([
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
                    ]),
                    encryptionKey: Optional([
                        "encryption_key": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    sso: Optional(true),
                    ssoDisabled: Optional(true),
                    crossOriginAuth: Optional(true),
                    crossOriginLoc: Optional("cross_origin_loc"),
                    customLoginPageOn: Optional(true),
                    customLoginPage: Optional("custom_login_page"),
                    customLoginPagePreview: Optional("custom_login_page_preview"),
                    formTemplate: Optional("form_template"),
                    isHerokuApp: Optional(true),
                    addons: Optional([
                        "addons": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    tokenEndpointAuthMethod: Optional("token_endpoint_auth_method"),
                    clientMetadata: Optional([
                        "client_metadata": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ]),
                    mobile: Optional([
                        "mobile": JSONValue.object(
                            [
                                "key": JSONValue.string("value")
                            ]
                        )
                    ])
                )
            ]
        )
        let response = try await client.service.listClients(
            fields: "fields",
            includeFields: true,
            page: 1,
            perPage: 1,
            includeTotals: true,
            isGlobal: true,
            isFirstParty: true,
            appType: [
                "app_type",
                "app_type"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getClient1() async throws -> Void {
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
            tenant: Optional("tenant"),
            name: "name",
            description: Optional("description"),
            global: Optional(true),
            clientSecret: Optional("client_secret"),
            appType: Optional("app_type"),
            logoUri: Optional("logo_uri"),
            isFirstParty: Optional(true),
            oidcConformant: Optional(true),
            callbacks: Optional([
                "callbacks",
                "callbacks"
            ]),
            allowedOrigins: Optional([
                "allowed_origins",
                "allowed_origins"
            ]),
            webOrigins: Optional([
                "web_origins",
                "web_origins"
            ]),
            grantTypes: Optional([
                "grant_types",
                "grant_types"
            ]),
            jwtConfiguration: Optional([
                "jwt_configuration": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            signingKeys: Optional([
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
            ]),
            encryptionKey: Optional([
                "encryption_key": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            sso: Optional(true),
            ssoDisabled: Optional(true),
            crossOriginAuth: Optional(true),
            crossOriginLoc: Optional("cross_origin_loc"),
            customLoginPageOn: Optional(true),
            customLoginPage: Optional("custom_login_page"),
            customLoginPagePreview: Optional("custom_login_page_preview"),
            formTemplate: Optional("form_template"),
            isHerokuApp: Optional(true),
            addons: Optional([
                "addons": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            tokenEndpointAuthMethod: Optional("token_endpoint_auth_method"),
            clientMetadata: Optional([
                "client_metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ]),
            mobile: Optional([
                "mobile": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ])
        )
        let response = try await client.service.getClient(
            clientId: "clientId",
            fields: "fields",
            includeFields: true,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}