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
            email: Nullable.value("email"),
            phone: "phone",
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Address(
                street: "street",
                city: Nullable.value("city"),
                state: "state",
                zipCode: "zipCode",
                country: Nullable.value("country"),
                buildingId: Nullable.value("buildingId"),
                tenantId: "tenantId"
            )
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
            email: Nullable.value("email"),
            phone: "phone",
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Address(
                street: "street",
                city: Nullable.value("city"),
                state: "state",
                zipCode: "zipCode",
                country: Nullable.value("country"),
                buildingId: Nullable.value("buildingId"),
                tenantId: "tenantId"
            )
        )
        let response = try await client.nullableOptional.createUser(request: CreateUserRequest(
            username: "username",
            email: .value("email"),
            phone: "phone",
            address: .value(Address(
                street: "street",
                city: .value("city"),
                state: "state",
                zipCode: "zipCode",
                country: .value("country"),
                buildingId: .value("buildingId"),
                tenantId: "tenantId"
            ))
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
            email: Nullable.value("email"),
            phone: "phone",
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Address(
                street: "street",
                city: Nullable.value("city"),
                state: "state",
                zipCode: "zipCode",
                country: Nullable.value("country"),
                buildingId: Nullable.value("buildingId"),
                tenantId: "tenantId"
            )
        )
        let response = try await client.nullableOptional.updateUser(
            userId: "userId",
            request: UpdateUserRequest(
                username: "username",
                email: .value("email"),
                phone: "phone",
                address: .value(Address(
                    street: "street",
                    city: .value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value("buildingId"),
                    tenantId: "tenantId"
                ))
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
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        ]
        let response = try await client.nullableOptional.listUsers(
            limit: 1,
            offset: 1,
            includeDeleted: true,
            sortBy: .value("sortBy")
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
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        ]
        let response = try await client.nullableOptional.searchUsers(
            query: "query",
            department: .value("department"),
            role: "role",
            isActive: .value(true)
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
            nullableRole: Nullable.value(.admin),
            optionalRole: .admin,
            optionalNullableRole: Nullable.value(.admin),
            nullableStatus: Nullable.value(.active),
            optionalStatus: .active,
            optionalNullableStatus: Nullable.value(.active),
            nullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            optionalNotification: .email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            nullableSearchResult: Nullable.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            )),
            optionalSearchResult: .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: Nullable.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: [
                "optionalArray",
                "optionalArray"
            ],
            optionalNullableArray: Nullable.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ]),
            nullableListOfNullables: Nullable.value([
                Nullable.value("nullableListOfNullables"),
                Nullable.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable.value([
                "nullableMapOfNullables": Nullable.value(Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                ))
            ]),
            nullableListOfUnions: Nullable.value([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )
            ]),
            optionalMapOfEnums: [
                "optionalMapOfEnums": .admin
            ]
        )
        let response = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
            id: "id",
            nullableRole: .value(.admin),
            optionalRole: .admin,
            optionalNullableRole: .value(.admin),
            nullableStatus: .value(.active),
            optionalStatus: .active,
            optionalNullableStatus: .value(.active),
            nullableNotification: .value(NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            optionalNotification: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNullableNotification: .value(NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            nullableSearchResult: .value(SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: .value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: .value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: .value("country"),
                        buildingId: .value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            )),
            optionalSearchResult: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: .value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: .value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: .value("country"),
                        buildingId: .value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: .value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: [
                "optionalArray",
                "optionalArray"
            ],
            optionalNullableArray: .value([
                "optionalNullableArray",
                "optionalNullableArray"
            ]),
            nullableListOfNullables: .value([
                .value("nullableListOfNullables"),
                .value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: .value([
                "nullableMapOfNullables": .value(Address(
                    street: "street",
                    city: .value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value("buildingId"),
                    tenantId: "tenantId"
                ))
            ]),
            nullableListOfUnions: .value([
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
            ]),
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
            nullableRole: Nullable.value(.admin),
            optionalRole: .admin,
            optionalNullableRole: Nullable.value(.admin),
            nullableStatus: Nullable.value(.active),
            optionalStatus: .active,
            optionalNullableStatus: Nullable.value(.active),
            nullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            optionalNotification: .email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            nullableSearchResult: Nullable.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            )),
            optionalSearchResult: .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: Nullable.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: [
                "optionalArray",
                "optionalArray"
            ],
            optionalNullableArray: Nullable.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ]),
            nullableListOfNullables: Nullable.value([
                Nullable.value("nullableListOfNullables"),
                Nullable.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable.value([
                "nullableMapOfNullables": Nullable.value(Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                ))
            ]),
            nullableListOfUnions: Nullable.value([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )
            ]),
            optionalMapOfEnums: [
                "optionalMapOfEnums": .admin
            ]
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
            nullableRole: Nullable.value(.admin),
            optionalRole: .admin,
            optionalNullableRole: Nullable.value(.admin),
            nullableStatus: Nullable.value(.active),
            optionalStatus: .active,
            optionalNullableStatus: Nullable.value(.active),
            nullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            optionalNotification: .email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            optionalNullableNotification: Nullable.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            nullableSearchResult: Nullable.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            )),
            optionalSearchResult: .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: Nullable.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: [
                "optionalArray",
                "optionalArray"
            ],
            optionalNullableArray: Nullable.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ]),
            nullableListOfNullables: Nullable.value([
                Nullable.value("nullableListOfNullables"),
                Nullable.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable.value([
                "nullableMapOfNullables": Nullable.value(Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                ))
            ]),
            nullableListOfUnions: Nullable.value([
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                ),
                .email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )
            ]),
            optionalMapOfEnums: [
                "optionalMapOfEnums": .admin
            ]
        )
        let response = try await client.nullableOptional.updateComplexProfile(
            profileId: "profileId",
            request: .init(
                nullableRole: .value(.admin),
                nullableStatus: .value(.active),
                nullableNotification: .value(NotificationMethod.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )),
                nullableSearchResult: .value(SearchResult.user(
                    .init(
                        id: "id",
                        username: "username",
                        email: .value("email"),
                        phone: "phone",
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: .value("city"),
                            state: "state",
                            zipCode: "zipCode",
                            country: .value("country"),
                            buildingId: .value("buildingId"),
                            tenantId: "tenantId"
                        )
                    )
                )),
                nullableArray: .value([
                    "nullableArray",
                    "nullableArray"
                ])
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
                nullableString: Nullable.value("nullableString"),
                optionalString: "optionalString",
                optionalNullableString: Nullable.value("optionalNullableString"),
                nullableEnum: Nullable.value(.admin),
                optionalEnum: .active,
                nullableUnion: Nullable.value(.email(
                    .init(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: "htmlContent"
                    )
                )),
                optionalUnion: .user(
                    .init(
                        id: "id",
                        username: "username",
                        email: Nullable.value("email"),
                        phone: "phone",
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: Nullable.value("city"),
                            state: "state",
                            zipCode: "zipCode",
                            country: Nullable.value("country"),
                            buildingId: Nullable.value("buildingId"),
                            tenantId: "tenantId"
                        )
                    )
                ),
                nullableList: Nullable.value([
                    "nullableList",
                    "nullableList"
                ]),
                nullableMap: Nullable.value([
                    "nullableMap": 1
                ]),
                nullableObject: Nullable.value(Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )),
                optionalObject: Organization(
                    id: "id",
                    name: "name",
                    domain: Nullable.value("domain"),
                    employeeCount: 1
                )
            ),
            processedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            nullCount: 1,
            presentFieldsCount: 1
        )
        let response = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
            requiredString: "requiredString",
            nullableString: .value("nullableString"),
            optionalString: "optionalString",
            optionalNullableString: .value("optionalNullableString"),
            nullableEnum: .value(.admin),
            optionalEnum: .active,
            nullableUnion: .value(NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )),
            optionalUnion: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: .value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: .value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: .value("country"),
                        buildingId: .value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableList: .value([
                "nullableList",
                "nullableList"
            ]),
            nullableMap: .value([
                "nullableMap": 1
            ]),
            nullableObject: .value(Address(
                street: "street",
                city: .value("city"),
                state: "state",
                zipCode: "zipCode",
                country: .value("country"),
                buildingId: .value("buildingId"),
                tenantId: "tenantId"
            )),
            optionalObject: Organization(
                id: "id",
                name: "name",
                domain: .value("domain"),
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
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable.value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: Nullable.value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: Nullable.value("country"),
                    buildingId: Nullable.value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        ]
        let response = try await client.nullableOptional.filterByRole(
            role: .value(.admin),
            status: .active,
            secondaryRole: .value(.admin)
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
        let expectedResponse = Nullable.value(.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
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
                tags: .value([
                    "tags",
                    "tags"
                ]),
                categories: [
                    "categories",
                    "categories"
                ],
                labels: .value([
                    "labels",
                    "labels"
                ])
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
        let expectedResponse = Nullable.value([
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            ),
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable.value("email"),
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: Nullable.value("city"),
                        state: "state",
                        zipCode: "zipCode",
                        country: Nullable.value("country"),
                        buildingId: Nullable.value("buildingId"),
                        tenantId: "tenantId"
                    )
                )
            )
        ])
        let response = try await client.nullableOptional.getSearchResults(request: .init(
            query: "query",
            filters: [
                "filters": .value("filters")
            ],
            includeTypes: .value([
                "includeTypes",
                "includeTypes"
            ])
        ))
        try #require(response == expectedResponse)
    }
}