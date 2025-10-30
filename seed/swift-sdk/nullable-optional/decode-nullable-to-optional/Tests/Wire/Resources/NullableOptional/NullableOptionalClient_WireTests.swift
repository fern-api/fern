import Foundation
import Testing
import NullableOptional

@Suite("NullableOptionalClient_ Wire Tests") struct NullableOptionalClient_WireTests {
    @Test func getUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "username": "username",
                  "email": "email",
                  "phone": "phone",
                  "createdAt": "2024-01-15T09:30:00Z",
                  "updatedAt": "2024-01-15T09:30:00Z",
                  "address": {
                    "street": "street",
                    "city": "city",
                    "state": "state",
                    "zipCode": "zipCode",
                    "country": "country",
                    "buildingId": "buildingId",
                    "tenantId": "tenantId"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Optional("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Optional("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Optional("country")),
                buildingId: Optional("buildingId"),
                tenantId: Optional("tenantId")
            ))
        )
        let response = try await client.nullableOptional.getUser(userId: "userId")
        try #require(response == expectedResponse)
    }

    @Test func createUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "username": "username",
                  "email": "email",
                  "phone": "phone",
                  "createdAt": "2024-01-15T09:30:00Z",
                  "updatedAt": "2024-01-15T09:30:00Z",
                  "address": {
                    "street": "street",
                    "city": "city",
                    "state": "state",
                    "zipCode": "zipCode",
                    "country": "country",
                    "buildingId": "buildingId",
                    "tenantId": "tenantId"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Optional("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Optional("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Optional("country")),
                buildingId: Optional("buildingId"),
                tenantId: Optional("tenantId")
            ))
        )
        let response = try await client.nullableOptional.createUser(request: CreateUserRequest(
            username: "username",
            email: "email",
            phone: "phone",
            address: Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            )
        ))
        try #require(response == expectedResponse)
    }

    @Test func updateUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "username": "username",
                  "email": "email",
                  "phone": "phone",
                  "createdAt": "2024-01-15T09:30:00Z",
                  "updatedAt": "2024-01-15T09:30:00Z",
                  "address": {
                    "street": "street",
                    "city": "city",
                    "state": "state",
                    "zipCode": "zipCode",
                    "country": "country",
                    "buildingId": "buildingId",
                    "tenantId": "tenantId"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Optional("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Optional("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Optional("country")),
                buildingId: Optional("buildingId"),
                tenantId: Optional("tenantId")
            ))
        )
        let response = try await client.nullableOptional.updateUser(
            userId: "userId",
            request: UpdateUserRequest(
                username: "username",
                email: "email",
                phone: "phone",
                address: Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func listUsers1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.listUsers(
            limit: 1,
            offset: 1,
            includeDeleted: true,
            sortBy: "sortBy"
        )
        try #require(response == expectedResponse)
    }

    @Test func searchUsers1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.searchUsers(
            query: "query",
            department: "department",
            role: "role",
            isActive: true
        )
        try #require(response == expectedResponse)
    }

    @Test func createComplexProfile1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "nullableRole": "ADMIN",
                  "optionalRole": "ADMIN",
                  "optionalNullableRole": "ADMIN",
                  "nullableStatus": "active",
                  "optionalStatus": "active",
                  "optionalNullableStatus": "active",
                  "nullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "nullableSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "optionalSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableArray": [
                    "nullableArray",
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray",
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray",
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables",
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "nullableMapOfNullables": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableListOfUnions": [
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    },
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "optionalMapOfEnums": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: Optional(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Optional(.admin)),
            nullableStatus: Optional(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Optional(.active)),
            nullableNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNullableNotification: Optional(Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Optional([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Optional([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Optional([
                Optional("nullableListOfNullables"),
                Optional("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Optional([
                "nullableMapOfNullables": Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Optional([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                )
            ]),
            optionalMapOfEnums: Optional([
                "optionalMapOfEnums": .admin
            ])
        )
        let response = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: .admin,
            optionalNullableRole: .admin,
            nullableStatus: .active,
            optionalStatus: .active,
            optionalNullableStatus: .active,
            nullableNotification: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNotification: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNullableNotification: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            nullableSearchResult: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: "email",
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    address: Address(
                        street: "street",
                        city: "city",
                        state: "state",
                        zipCode: "zipCode",
                        country: "country",
                        buildingId: "buildingId",
                        tenantId: "tenantId"
                    )
                )
            ),
            optionalSearchResult: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: "email",
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    address: Address(
                        street: "street",
                        city: "city",
                        state: "state",
                        zipCode: "zipCode",
                        country: "country",
                        buildingId: "buildingId",
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: [
                "nullableArray",
                "nullableArray"
            ],
            optionalArray: [
                "optionalArray",
                "optionalArray"
            ],
            optionalNullableArray: [
                "optionalNullableArray",
                "optionalNullableArray"
            ],
            nullableListOfNullables: [
                "nullableListOfNullables",
                "nullableListOfNullables"
            ],
            nullableMapOfNullables: [
                "nullableMapOfNullables": Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            ],
            nullableListOfUnions: [
                NotificationMethod.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                ),
                NotificationMethod.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )
            ],
            optionalMapOfEnums: [
                "optionalMapOfEnums": .admin
            ]
        ))
        try #require(response == expectedResponse)
    }

    @Test func getComplexProfile1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "nullableRole": "ADMIN",
                  "optionalRole": "ADMIN",
                  "optionalNullableRole": "ADMIN",
                  "nullableStatus": "active",
                  "optionalStatus": "active",
                  "optionalNullableStatus": "active",
                  "nullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "nullableSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "optionalSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableArray": [
                    "nullableArray",
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray",
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray",
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables",
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "nullableMapOfNullables": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableListOfUnions": [
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    },
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "optionalMapOfEnums": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: Optional(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Optional(.admin)),
            nullableStatus: Optional(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Optional(.active)),
            nullableNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNullableNotification: Optional(Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Optional([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Optional([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Optional([
                Optional("nullableListOfNullables"),
                Optional("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Optional([
                "nullableMapOfNullables": Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Optional([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                )
            ]),
            optionalMapOfEnums: Optional([
                "optionalMapOfEnums": .admin
            ])
        )
        let response = try await client.nullableOptional.getComplexProfile(profileId: "profileId")
        try #require(response == expectedResponse)
    }

    @Test func updateComplexProfile1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "nullableRole": "ADMIN",
                  "optionalRole": "ADMIN",
                  "optionalNullableRole": "ADMIN",
                  "nullableStatus": "active",
                  "optionalStatus": "active",
                  "optionalNullableStatus": "active",
                  "nullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "optionalNullableNotification": {
                    "type": "email",
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent"
                  },
                  "nullableSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "optionalSearchResult": {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableArray": [
                    "nullableArray",
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray",
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray",
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables",
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "nullableMapOfNullables": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  "nullableListOfUnions": [
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    },
                    {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "optionalMapOfEnums": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: Optional(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Optional(.admin)),
            nullableStatus: Optional(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Optional(.active)),
            nullableNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNotification: Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            )),
            optionalNullableNotification: Optional(Optional(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Optional([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Optional([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Optional([
                Optional("nullableListOfNullables"),
                Optional("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Optional([
                "nullableMapOfNullables": Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Optional([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                )
            ]),
            optionalMapOfEnums: Optional([
                "optionalMapOfEnums": .admin
            ])
        )
        let response = try await client.nullableOptional.updateComplexProfile(
            profileId: "profileId",
            request: .init(
                nullableRole: .admin,
                nullableStatus: .active,
                nullableNotification: NotificationMethod.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                ),
                nullableSearchResult: SearchResult.user(
                    .init(
                        id: "id",
                        username: "username",
                        email: "email",
                        phone: "phone",
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        address: Address(
                            street: "street",
                            city: "city",
                            state: "state",
                            zipCode: "zipCode",
                            country: "country",
                            buildingId: "buildingId",
                            tenantId: "tenantId"
                        )
                    )
                ),
                nullableArray: [
                    "nullableArray",
                    "nullableArray"
                ]
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func testDeserialization1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "echo": {
                    "requiredString": "requiredString",
                    "nullableString": "nullableString",
                    "optionalString": "optionalString",
                    "optionalNullableString": "optionalNullableString",
                    "nullableEnum": "ADMIN",
                    "optionalEnum": "active",
                    "nullableUnion": {
                      "type": "email",
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent"
                    },
                    "optionalUnion": {
                      "type": "user",
                      "id": "id",
                      "username": "username",
                      "email": "email",
                      "phone": "phone",
                      "createdAt": "2024-01-15T09:30:00Z",
                      "updatedAt": "2024-01-15T09:30:00Z",
                      "address": {
                        "street": "street",
                        "city": "city",
                        "state": "state",
                        "zipCode": "zipCode",
                        "country": "country",
                        "buildingId": "buildingId",
                        "tenantId": "tenantId"
                      }
                    },
                    "nullableList": [
                      "nullableList",
                      "nullableList"
                    ],
                    "nullableMap": {
                      "nullableMap": 1
                    },
                    "nullableObject": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    },
                    "optionalObject": {
                      "id": "id",
                      "name": "name",
                      "domain": "domain",
                      "employeeCount": 1
                    }
                  },
                  "processedAt": "2024-01-15T09:30:00Z",
                  "nullCount": 1,
                  "presentFieldsCount": 1
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = DeserializationTestResponse(
            echo: DeserializationTestRequest(
                requiredString: "requiredString",
                nullableString: Optional("nullableString"),
                optionalString: Optional("optionalString"),
                optionalNullableString: Optional(Optional("optionalNullableString")),
                nullableEnum: Optional(.admin),
                optionalEnum: Optional(.active),
                nullableUnion: Optional(.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional("htmlContent")
                    )
                )),
                optionalUnion: Optional(.user(
                    .init(
                        id: "id",
                        username: "username",
                        email: Optional("email"),
                        phone: Optional("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Optional(Address(
                            street: "street",
                            city: Optional("city"),
                            state: Optional("state"),
                            zipCode: "zipCode",
                            country: Optional(Optional("country")),
                            buildingId: Optional("buildingId"),
                            tenantId: Optional("tenantId")
                        ))
                    )
                )),
                nullableList: Optional([
                    "nullableList",
                    "nullableList"
                ]),
                nullableMap: Optional([
                    "nullableMap": 1
                ]),
                nullableObject: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                )),
                optionalObject: Optional(Organization(
                    id: "id",
                    name: "name",
                    domain: Optional("domain"),
                    employeeCount: Optional(1)
                ))
            ),
            processedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            nullCount: 1,
            presentFieldsCount: 1
        )
        let response = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
            requiredString: "requiredString",
            nullableString: "nullableString",
            optionalString: "optionalString",
            optionalNullableString: "optionalNullableString",
            nullableEnum: .admin,
            optionalEnum: .active,
            nullableUnion: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalUnion: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: "email",
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    address: Address(
                        street: "street",
                        city: "city",
                        state: "state",
                        zipCode: "zipCode",
                        country: "country",
                        buildingId: "buildingId",
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableList: [
                "nullableList",
                "nullableList"
            ],
            nullableMap: [
                "nullableMap": 1
            ],
            nullableObject: Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            ),
            optionalObject: Organization(
                id: "id",
                name: "name",
                domain: "domain",
                employeeCount: 1
            )
        ))
        try #require(response == expectedResponse)
    }

    @Test func filterByRole1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  {
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Optional("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Optional("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Optional("country")),
                    buildingId: Optional("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.filterByRole(
            role: .admin,
            status: .active,
            secondaryRole: .admin
        )
        try #require(response == expectedResponse)
    }

    @Test func getNotificationSettings1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                }
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: Optional("htmlContent")
            )
        ))
        let response = try await client.nullableOptional.getNotificationSettings(userId: "userId")
        try #require(response == expectedResponse)
    }

    @Test func updateTags1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string",
                  "string"
                ]
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.nullableOptional.updateTags(
            userId: "userId",
            request: .init(
                tags: [
                    "tags",
                    "tags"
                ],
                categories: [
                    "categories",
                    "categories"
                ],
                labels: [
                    "labels",
                    "labels"
                ]
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func getSearchResults1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  },
                  {
                    "type": "user",
                    "id": "id",
                    "username": "username",
                    "email": "email",
                    "phone": "phone",
                    "createdAt": "2024-01-15T09:30:00Z",
                    "updatedAt": "2024-01-15T09:30:00Z",
                    "address": {
                      "street": "street",
                      "city": "city",
                      "state": "state",
                      "zipCode": "zipCode",
                      "country": "country",
                      "buildingId": "buildingId",
                      "tenantId": "tenantId"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional([
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            ),
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Optional("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Optional("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Optional("country")),
                        buildingId: Optional("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )
        ])
        let response = try await client.nullableOptional.getSearchResults(request: .init(
            query: "query",
            filters: [
                "filters": "filters"
            ],
            includeTypes: [
                "includeTypes",
                "includeTypes"
            ]
        ))
        try #require(response == expectedResponse)
    }
}