import Foundation
import Testing
import NullableOptional

@Suite("NullableOptionalClient_ Wire Tests") struct NullableOptionalClient_WireTests {
    @Test func getUser1() async throws -> Void {
        let stub = HTTPStub()
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
            email: Nullable<String>.value("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<String>.value("buildingId"),
                tenantId: Optional("tenantId")
            ))
        )
        let response = try await client.nullableOptional.getUser(
            userId: "userId",
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
            email: Nullable<String>.value("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<String>.value("buildingId"),
                tenantId: Optional("tenantId")
            ))
        )
        let response = try await client.nullableOptional.createUser(
            request: CreateUserRequest(
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
            email: Nullable<String>.value("email"),
            phone: Optional("phone"),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional("state"),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<String>.value("buildingId"),
                tenantId: Optional("tenantId")
            ))
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
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.listUsers(
            limit: 1,
            offset: 1,
            includeDeleted: true,
            sortBy: .value("sortBy"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchUsers1() async throws -> Void {
        let stub = HTTPStub()
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
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.searchUsers(
            query: "query",
            department: .value("department"),
            role: "role",
            isActive: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createComplexProfile1() async throws -> Void {
        let stub = HTTPStub()
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
            nullableRole: Nullable<UserRole>.value(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Nullable<UserRole>.value(.admin)),
            nullableStatus: Nullable<UserStatus>.value(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Nullable<UserStatus>.value(.active)),
            nullableNotification: Nullable<NotificationMethod>.value(.email(
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
            optionalNullableNotification: Optional(Nullable<NotificationMethod>.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Nullable<SearchResult>.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables"),
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "nullableMapOfNullables": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
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
        let response = try await client.nullableOptional.createComplexProfile(
            request: ComplexProfile(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getComplexProfile1() async throws -> Void {
        let stub = HTTPStub()
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
            nullableRole: Nullable<UserRole>.value(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Nullable<UserRole>.value(.admin)),
            nullableStatus: Nullable<UserStatus>.value(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Nullable<UserStatus>.value(.active)),
            nullableNotification: Nullable<NotificationMethod>.value(.email(
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
            optionalNullableNotification: Optional(Nullable<NotificationMethod>.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Nullable<SearchResult>.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables"),
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "nullableMapOfNullables": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
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
        let response = try await client.nullableOptional.getComplexProfile(
            profileId: "profileId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateComplexProfile1() async throws -> Void {
        let stub = HTTPStub()
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
            nullableRole: Nullable<UserRole>.value(.admin),
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(Nullable<UserRole>.value(.admin)),
            nullableStatus: Nullable<UserStatus>.value(.active),
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(Nullable<UserStatus>.value(.active)),
            nullableNotification: Nullable<NotificationMethod>.value(.email(
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
            optionalNullableNotification: Optional(Nullable<NotificationMethod>.value(.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional("htmlContent")
                )
            ))),
            nullableSearchResult: Nullable<SearchResult>.value(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            optionalSearchResult: Optional(.user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional([
                "optionalArray",
                "optionalArray"
            ]),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray",
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables"),
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "nullableMapOfNullables": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testDeserialization1() async throws -> Void {
        let stub = HTTPStub()
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
                nullableString: Nullable<String>.value("nullableString"),
                optionalString: Optional("optionalString"),
                optionalNullableString: Optional(Nullable<String>.value("optionalNullableString")),
                nullableEnum: Nullable<UserRole>.value(.admin),
                optionalEnum: Optional(.active),
                nullableUnion: Nullable<NotificationMethod>.value(.email(
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
                        email: Nullable<String>.value("email"),
                        phone: Optional("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Optional(Address(
                            street: "street",
                            city: Nullable<String>.value("city"),
                            state: Optional("state"),
                            zipCode: "zipCode",
                            country: Optional(Nullable<String>.value("country")),
                            buildingId: Nullable<String>.value("buildingId"),
                            tenantId: Optional("tenantId")
                        ))
                    )
                )),
                nullableList: Nullable<[String]>.value([
                    "nullableList",
                    "nullableList"
                ]),
                nullableMap: Nullable<[String: Int]>.value([
                    "nullableMap": 1
                ]),
                nullableObject: Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                )),
                optionalObject: Optional(Organization(
                    id: "id",
                    name: "name",
                    domain: Nullable<String>.value("domain"),
                    employeeCount: Optional(1)
                ))
            ),
            processedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            nullCount: 1,
            presentFieldsCount: 1
        )
        let response = try await client.nullableOptional.testDeserialization(
            request: DeserializationTestRequest(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func filterByRole1() async throws -> Void {
        let stub = HTTPStub()
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
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional("state"),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<String>.value("buildingId"),
                    tenantId: Optional("tenantId")
                ))
            )
        ]
        let response = try await client.nullableOptional.filterByRole(
            role: .value(.admin),
            status: .active,
            secondaryRole: .value(.admin),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getNotificationSettings1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = Nullable<NotificationMethod>.value(.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: Optional("htmlContent")
            )
        ))
        let response = try await client.nullableOptional.getNotificationSettings(
            userId: "userId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateTags1() async throws -> Void {
        let stub = HTTPStub()
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getSearchResults1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = Nullable<[SearchResult]>.value([
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            ),
            .user(
                .init(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional("state"),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<String>.value("buildingId"),
                        tenantId: Optional("tenantId")
                    ))
                )
            )
        ])
        let response = try await client.nullableOptional.getSearchResults(
            request: .init(
                query: "query",
                filters: [
                    "filters": .value("filters")
                ],
                includeTypes: .value([
                    "includeTypes",
                    "includeTypes"
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}