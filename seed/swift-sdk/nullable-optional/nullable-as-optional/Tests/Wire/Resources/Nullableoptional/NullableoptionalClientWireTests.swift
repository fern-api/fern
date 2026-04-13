import Foundation
import Testing
import Api

@Suite("NullableoptionalClient Wire Tests") struct NullableoptionalClientWireTests {
    @Test func getuser1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.getuser(
            userId: "userId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getuser2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.getuser(
            userId: "userId",
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.updateuser(
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.updateuser(
            userId: "userId",
            request: .init(
                username: .value("username"),
                email: .value("email"),
                phone: .value("phone"),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: .value("state"),
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value(.value("buildingId")),
                    tenantId: .value(.value("tenantId"))
                )
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
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.listusers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listusers2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.listusers(
            limit: .value(1),
            offset: .value(1),
            includeDeleted: .value(true),
            sortBy: .value("sortBy"),
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.createuser(
            request: .init(
                username: "username",
                email: .null
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UserResponse(
            id: "id",
            username: "username",
            email: Nullable<String>.value("email"),
            phone: Optional(Nullable<String>.value("phone")),
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            address: Optional(Address(
                street: "street",
                city: Nullable<String>.value("city"),
                state: Optional(Nullable<String>.value("state")),
                zipCode: "zipCode",
                country: Optional(Nullable<String>.value("country")),
                buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
            ))
        )
        let response = try await client.nullableoptional.createuser(
            request: .init(
                username: "username",
                email: .value("email"),
                phone: .value("phone"),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: .value("state"),
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value(.value("buildingId")),
                    tenantId: .value(.value("tenantId"))
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchusers1() async throws -> Void {
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
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.searchusers(
            query: "query",
            department: .value("department"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchusers2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.searchusers(
            query: "query",
            department: .value("department"),
            role: .value("role"),
            isActive: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createcomplexprofile1() async throws -> Void {
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
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNullableNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "nullableSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "optionalSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "nullableArray": [
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "key": {
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
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent",
                      "type": "email"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "key": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray"
            ])),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "key": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent")),
                        type: .email
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "key": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.createcomplexprofile(
            request: ComplexProfile(
                id: "id",
                nullableRole: .admin,
                nullableStatus: .active,
                nullableNotification: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        type: .email
                    )
                ),
                nullableSearchResult: SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: .null,
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .null,
                        type: .user
                    )
                ),
                nullableArray: .null,
                nullableListOfNullables: .null,
                nullableMapOfNullables: .null,
                nullableListOfUnions: .null
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createcomplexprofile2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray",
                "optionalArray"
            ])),
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
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                ),
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "optionalMapOfEnums": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.createcomplexprofile(
            request: ComplexProfile(
                id: "id",
                nullableRole: .admin,
                optionalRole: .admin,
                optionalNullableRole: .admin,
                nullableStatus: .active,
                optionalStatus: .active,
                optionalNullableStatus: .active,
                nullableNotification: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: .value("htmlContent"),
                        type: .email
                    )
                ),
                optionalNotification: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: .value("htmlContent"),
                        type: .email
                    )
                ),
                optionalNullableNotification: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: .value("htmlContent"),
                        type: .email
                    )
                ),
                nullableSearchResult: SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: .value("email"),
                        phone: .value("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: .value("city"),
                            state: .value("state"),
                            zipCode: "zipCode",
                            country: .value("country"),
                            buildingId: .value(.value("buildingId")),
                            tenantId: .value(.value("tenantId"))
                        ),
                        type: .user
                    )
                ),
                optionalSearchResult: SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: .value("email"),
                        phone: .value("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: .value("city"),
                            state: .value("state"),
                            zipCode: "zipCode",
                            country: .value("country"),
                            buildingId: .value(.value("buildingId")),
                            tenantId: .value(.value("tenantId"))
                        ),
                        type: .user
                    )
                ),
                nullableArray: .value([
                    "nullableArray",
                    "nullableArray"
                ]),
                optionalArray: .value([
                    "optionalArray",
                    "optionalArray"
                ]),
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
                        state: .value("state"),
                        zipCode: "zipCode",
                        country: .value("country"),
                        buildingId: .value(.value("buildingId")),
                        tenantId: .value(.value("tenantId"))
                    ))
                ]),
                nullableListOfUnions: .value([
                    NotificationMethod.notificationMethodZero(
                        NotificationMethodZero(
                            emailAddress: "emailAddress",
                            subject: "subject",
                            htmlContent: .value("htmlContent"),
                            type: .email
                        )
                    ),
                    NotificationMethod.notificationMethodZero(
                        NotificationMethodZero(
                            emailAddress: "emailAddress",
                            subject: "subject",
                            htmlContent: .value("htmlContent"),
                            type: .email
                        )
                    )
                ]),
                optionalMapOfEnums: .value([
                    "optionalMapOfEnums": .value(.admin)
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getcomplexprofile1() async throws -> Void {
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
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNullableNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "nullableSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "optionalSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "nullableArray": [
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "key": {
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
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent",
                      "type": "email"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "key": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray"
            ])),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "key": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent")),
                        type: .email
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "key": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.getcomplexprofile(
            profileId: "profileId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getcomplexprofile2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray",
                "optionalArray"
            ])),
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
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                ),
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "optionalMapOfEnums": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.getcomplexprofile(
            profileId: "profileId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updatecomplexprofile1() async throws -> Void {
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
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "optionalNullableNotification": {
                    "emailAddress": "emailAddress",
                    "subject": "subject",
                    "htmlContent": "htmlContent",
                    "type": "email"
                  },
                  "nullableSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "optionalSearchResult": {
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
                    },
                    "type": "user"
                  },
                  "nullableArray": [
                    "nullableArray"
                  ],
                  "optionalArray": [
                    "optionalArray"
                  ],
                  "optionalNullableArray": [
                    "optionalNullableArray"
                  ],
                  "nullableListOfNullables": [
                    "nullableListOfNullables"
                  ],
                  "nullableMapOfNullables": {
                    "key": {
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
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent",
                      "type": "email"
                    }
                  ],
                  "optionalMapOfEnums": {
                    "key": "ADMIN"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent")),
                    type: .email
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray"
            ])),
            optionalNullableArray: Optional(Nullable<[String]>.value([
                "optionalNullableArray"
            ])),
            nullableListOfNullables: Nullable<[Nullable<String>]>.value([
                Nullable<String>.value("nullableListOfNullables")
            ]),
            nullableMapOfNullables: Nullable<[String: Nullable<Address>]>.value([
                "key": Nullable<Address>.value(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent")),
                        type: .email
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "key": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.updatecomplexprofile(
            profileId: "profileId",
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updatecomplexprofile2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ComplexProfile(
            id: "id",
            nullableRole: .admin,
            optionalRole: Optional(.admin),
            optionalNullableRole: Optional(.admin),
            nullableStatus: .active,
            optionalStatus: Optional(.active),
            optionalNullableStatus: Optional(.active),
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            ),
            optionalNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            optionalNullableNotification: Optional(NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    type: .email,
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: Optional(Nullable<String>.value("htmlContent"))
                )
            )),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            ),
            optionalSearchResult: Optional(SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            )),
            nullableArray: Nullable<[String]>.value([
                "nullableArray",
                "nullableArray"
            ]),
            optionalArray: Optional(Nullable<[String]>.value([
                "optionalArray",
                "optionalArray"
            ])),
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
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ]),
            nullableListOfUnions: Nullable<[NotificationMethod]>.value([
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                ),
                NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                )
            ]),
            optionalMapOfEnums: Optional(Nullable<[String: Nullable<UserRole>]>.value([
                "optionalMapOfEnums": Nullable<UserRole>.value(.admin)
            ]))
        )
        let response = try await client.nullableoptional.updatecomplexprofile(
            profileId: "profileId",
            request: .init(
                nullableRole: .admin,
                nullableStatus: .active,
                nullableNotification: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: .value("htmlContent"),
                        type: .email
                    )
                ),
                nullableSearchResult: SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: .value("email"),
                        phone: .value("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: .value("city"),
                            state: .value("state"),
                            zipCode: "zipCode",
                            country: .value("country"),
                            buildingId: .value(.value("buildingId")),
                            tenantId: .value(.value("tenantId"))
                        ),
                        type: .user
                    )
                ),
                nullableArray: .value([
                    "nullableArray",
                    "nullableArray"
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testdeserialization1() async throws -> Void {
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
                      "emailAddress": "emailAddress",
                      "subject": "subject",
                      "htmlContent": "htmlContent",
                      "type": "email"
                    },
                    "optionalUnion": {
                      "id": "id",
                      "username": "username",
                      "email": "email",
                      "phone": "phone",
                      "createdAt": "2024-01-15T09:30:00Z",
                      "updatedAt": "2024-01-15T09:30:00Z",
                      "address": {
                        "street": "street",
                        "city": null,
                        "zipCode": "zipCode",
                        "buildingId": null,
                        "tenantId": null
                      },
                      "type": "user"
                    },
                    "nullableList": [
                      "nullableList"
                    ],
                    "nullableMap": {
                      "key": 1
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = DeserializationTestResponse(
            echo: DeserializationTestRequest(
                requiredString: "requiredString",
                nullableString: Nullable<String>.value("nullableString"),
                optionalString: Optional(Nullable<String>.value("optionalString")),
                optionalNullableString: Optional(Nullable<String>.value("optionalNullableString")),
                nullableEnum: .admin,
                optionalEnum: Optional(.active),
                nullableUnion: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent")),
                        type: .email
                    )
                ),
                optionalUnion: Optional(SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: Nullable<String>.value("email"),
                        phone: Optional(Nullable<String>.value("phone")),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Optional(Address(
                            street: "street",
                            city: .null,
                            zipCode: "zipCode",
                            buildingId: .null,
                            tenantId: .null
                        )),
                        type: .user
                    )
                )),
                nullableList: Nullable<[String]>.value([
                    "nullableList"
                ]),
                nullableMap: Nullable<[String: Nullable<Int>]>.value([
                    "key": Nullable<Int>.value(1)
                ]),
                nullableObject: Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ),
                optionalObject: Optional(Organization(
                    id: "id",
                    name: "name",
                    domain: Nullable<String>.value("domain"),
                    employeeCount: Optional(Nullable<Int>.value(1))
                ))
            ),
            processedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            nullCount: 1,
            presentFieldsCount: 1
        )
        let response = try await client.nullableoptional.testdeserialization(
            request: DeserializationTestRequest(
                requiredString: "requiredString",
                nullableString: .null,
                nullableEnum: .admin,
                nullableUnion: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        type: .email
                    )
                ),
                nullableList: .null,
                nullableMap: .null,
                nullableObject: Address(
                    street: "street",
                    city: .null,
                    zipCode: "zipCode",
                    buildingId: .null,
                    tenantId: .null
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testdeserialization2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = DeserializationTestResponse(
            echo: DeserializationTestRequest(
                requiredString: "requiredString",
                nullableString: Nullable<String>.value("nullableString"),
                optionalString: Optional(Nullable<String>.value("optionalString")),
                optionalNullableString: Optional(Nullable<String>.value("optionalNullableString")),
                nullableEnum: .admin,
                optionalEnum: Optional(.active),
                nullableUnion: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        type: .email,
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: Optional(Nullable<String>.value("htmlContent"))
                    )
                ),
                optionalUnion: Optional(SearchResult.searchResultZero(
                    SearchResultZero(
                        type: .user,
                        id: "id",
                        username: "username",
                        email: Nullable<String>.value("email"),
                        phone: Optional(Nullable<String>.value("phone")),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Optional(Address(
                            street: "street",
                            city: Nullable<String>.value("city"),
                            state: Optional(Nullable<String>.value("state")),
                            zipCode: "zipCode",
                            country: Optional(Nullable<String>.value("country")),
                            buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                            tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                        ))
                    )
                )),
                nullableList: Nullable<[String]>.value([
                    "nullableList",
                    "nullableList"
                ]),
                nullableMap: Nullable<[String: Nullable<Int>]>.value([
                    "nullableMap": Nullable<Int>.value(1)
                ]),
                nullableObject: Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ),
                optionalObject: Optional(Organization(
                    id: "id",
                    name: "name",
                    domain: Nullable<String>.value("domain"),
                    employeeCount: Optional(Nullable<Int>.value(1))
                ))
            ),
            processedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            nullCount: 1,
            presentFieldsCount: 1
        )
        let response = try await client.nullableoptional.testdeserialization(
            request: DeserializationTestRequest(
                requiredString: "requiredString",
                nullableString: .value("nullableString"),
                optionalString: .value("optionalString"),
                optionalNullableString: .value("optionalNullableString"),
                nullableEnum: .admin,
                optionalEnum: .active,
                nullableUnion: NotificationMethod.notificationMethodZero(
                    NotificationMethodZero(
                        emailAddress: "emailAddress",
                        subject: "subject",
                        htmlContent: .value("htmlContent"),
                        type: .email
                    )
                ),
                optionalUnion: SearchResult.searchResultZero(
                    SearchResultZero(
                        id: "id",
                        username: "username",
                        email: .value("email"),
                        phone: .value("phone"),
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        address: Address(
                            street: "street",
                            city: .value("city"),
                            state: .value("state"),
                            zipCode: "zipCode",
                            country: .value("country"),
                            buildingId: .value(.value("buildingId")),
                            tenantId: .value(.value("tenantId"))
                        ),
                        type: .user
                    )
                ),
                nullableList: .value([
                    "nullableList",
                    "nullableList"
                ]),
                nullableMap: .value([
                    "nullableMap": .value(1)
                ]),
                nullableObject: Address(
                    street: "street",
                    city: .value("city"),
                    state: .value("state"),
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value(.value("buildingId")),
                    tenantId: .value(.value("tenantId"))
                ),
                optionalObject: Organization(
                    id: "id",
                    name: "name",
                    domain: .value("domain"),
                    employeeCount: .value(1)
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func filterbyrole1() async throws -> Void {
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
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.filterbyrole(
            role: .admin,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func filterbyrole2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            ),
            UserResponse(
                id: "id",
                username: "username",
                email: Nullable<String>.value("email"),
                phone: Optional(Nullable<String>.value("phone")),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Optional(Address(
                    street: "street",
                    city: Nullable<String>.value("city"),
                    state: Optional(Nullable<String>.value("state")),
                    zipCode: "zipCode",
                    country: Optional(Nullable<String>.value("country")),
                    buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                    tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                ))
            )
        ]
        let response = try await client.nullableoptional.filterbyrole(
            role: .admin,
            status: .active,
            secondaryRole: .admin,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getnotificationsettings1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent",
                  "type": "email"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: Optional(Nullable<String>.value("htmlContent")),
                type: .email
            )
        )
        let response = try await client.nullableoptional.getnotificationsettings(
            userId: "userId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getnotificationsettings2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                type: .email,
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: Optional(Nullable<String>.value("htmlContent"))
            )
        )
        let response = try await client.nullableoptional.getnotificationsettings(
            userId: "userId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updatetags1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string"
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string"
        ]
        let response = try await client.nullableoptional.updatetags(
            userId: "userId",
            request: .init(tags: .null),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updatetags2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.nullableoptional.updatetags(
            userId: "userId",
            request: .init(
                tags: .value([
                    "tags",
                    "tags"
                ]),
                categories: .value([
                    "categories",
                    "categories"
                ]),
                labels: .value([
                    "labels",
                    "labels"
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getsearchresults1() async throws -> Void {
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
                    },
                    "type": "user"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Nullable<[SearchResult]>.value([
            SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    )),
                    type: .user
                )
            )
        ])
        let response = try await client.nullableoptional.getsearchresults(
            request: .init(
                query: "query",
                includeTypes: .null
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getsearchresults2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Nullable<[SearchResult]>.value([
            SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            ),
            SearchResult.searchResultZero(
                SearchResultZero(
                    type: .user,
                    id: "id",
                    username: "username",
                    email: Nullable<String>.value("email"),
                    phone: Optional(Nullable<String>.value("phone")),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Optional(Address(
                        street: "street",
                        city: Nullable<String>.value("city"),
                        state: Optional(Nullable<String>.value("state")),
                        zipCode: "zipCode",
                        country: Optional(Nullable<String>.value("country")),
                        buildingId: Nullable<NullableUserId>.value(Nullable<String>.value("buildingId")),
                        tenantId: Nullable<OptionalUserId>.value(Nullable<String>.value("tenantId"))
                    ))
                )
            )
        ])
        let response = try await client.nullableoptional.getsearchresults(
            request: .init(
                query: "query",
                filters: .value([
                    "filters": .value("filters")
                ]),
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