import Foundation
import Testing
import Exhaustive

@Suite("ObjectClient Wire Tests") struct ObjectClientWireTests {
    @Test func getAndReturnWithOptionalField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string",
                  "integer": 1,
                  "long": 1000000,
                  "double": 1.1,
                  "bool": true,
                  "datetime": "2024-01-15T09:30:00Z",
                  "date": "2023-01-15",
                  "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "base64": "SGVsbG8gd29ybGQh",
                  "list": [
                    "list",
                    "list"
                  ],
                  "set": [
                    "set"
                  ],
                  "map": {
                    "1": "map"
                  },
                  "bigint": "1000000"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithOptionalField(
            string: Optional("string"),
            integer: Optional(1),
            long: Optional(1000000),
            double: Optional(1.1),
            bool: Optional(true),
            datetime: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            date: Optional(CalendarDate("2023-01-15")!),
            uuid: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!),
            base64: Optional("SGVsbG8gd29ybGQh"),
            list: Optional([
                "list",
                "list"
            ]),
            set: Optional([]),
            map: Optional([
                1: "map"
            ]),
            bigint: Optional("1000000")
        )
        let response = try await client.endpoints.object.getAndReturnWithOptionalField(
            request: ObjectWithOptionalField(
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                date: CalendarDate("2023-01-15")!,
                uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                base64: "SGVsbG8gd29ybGQh",
                list: [
                    "list",
                    "list"
                ],
                map: [
                    1: "map"
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithRequiredField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpoints.object.getAndReturnWithRequiredField(
            request: ObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithMapOfMap1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "map": {
                    "map": {
                      "map": "map"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithMapOfMap(
            map: [
                "map": [
                    "map": "map"
                ]
            ]
        )
        let response = try await client.endpoints.object.getAndReturnWithMapOfMap(
            request: ObjectWithMapOfMap(
                map: [
                    "map": [
                        "map": "map"
                    ]
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithOptionalField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string",
                  "NestedObject": {
                    "string": "string",
                    "integer": 1,
                    "long": 1000000,
                    "double": 1.1,
                    "bool": true,
                    "datetime": "2024-01-15T09:30:00Z",
                    "date": "2023-01-15",
                    "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "base64": "SGVsbG8gd29ybGQh",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "1": "map"
                    },
                    "bigint": "1000000"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = NestedObjectWithOptionalField(
            string: Optional("string"),
            nestedObject: Optional(ObjectWithOptionalField(
                string: Optional("string"),
                integer: Optional(1),
                long: Optional(1000000),
                double: Optional(1.1),
                bool: Optional(true),
                datetime: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                date: Optional(CalendarDate("2023-01-15")!),
                uuid: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!),
                base64: Optional("SGVsbG8gd29ybGQh"),
                list: Optional([
                    "list",
                    "list"
                ]),
                set: Optional([]),
                map: Optional([
                    1: "map"
                ]),
                bigint: Optional("1000000")
            ))
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithOptionalField(
            request: NestedObjectWithOptionalField(
                string: "string",
                nestedObject: ObjectWithOptionalField(
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    date: CalendarDate("2023-01-15")!,
                    uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    base64: "SGVsbG8gd29ybGQh",
                    list: [
                        "list",
                        "list"
                    ],
                    map: [
                        1: "map"
                    ]
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithRequiredField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string",
                  "NestedObject": {
                    "string": "string",
                    "integer": 1,
                    "long": 1000000,
                    "double": 1.1,
                    "bool": true,
                    "datetime": "2024-01-15T09:30:00Z",
                    "date": "2023-01-15",
                    "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "base64": "SGVsbG8gd29ybGQh",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "1": "map"
                    },
                    "bigint": "1000000"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = NestedObjectWithRequiredField(
            string: "string",
            nestedObject: ObjectWithOptionalField(
                string: Optional("string"),
                integer: Optional(1),
                long: Optional(1000000),
                double: Optional(1.1),
                bool: Optional(true),
                datetime: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                date: Optional(CalendarDate("2023-01-15")!),
                uuid: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!),
                base64: Optional("SGVsbG8gd29ybGQh"),
                list: Optional([
                    "list",
                    "list"
                ]),
                set: Optional([]),
                map: Optional([
                    1: "map"
                ]),
                bigint: Optional("1000000")
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
            string: "string",
            request: NestedObjectWithRequiredField(
                string: "string",
                nestedObject: ObjectWithOptionalField(
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    date: CalendarDate("2023-01-15")!,
                    uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    base64: "SGVsbG8gd29ybGQh",
                    list: [
                        "list",
                        "list"
                    ],
                    map: [
                        1: "map"
                    ]
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithRequiredFieldAsList1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string",
                  "NestedObject": {
                    "string": "string",
                    "integer": 1,
                    "long": 1000000,
                    "double": 1.1,
                    "bool": true,
                    "datetime": "2024-01-15T09:30:00Z",
                    "date": "2023-01-15",
                    "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "base64": "SGVsbG8gd29ybGQh",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "1": "map"
                    },
                    "bigint": "1000000"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = NestedObjectWithRequiredField(
            string: "string",
            nestedObject: ObjectWithOptionalField(
                string: Optional("string"),
                integer: Optional(1),
                long: Optional(1000000),
                double: Optional(1.1),
                bool: Optional(true),
                datetime: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                date: Optional(CalendarDate("2023-01-15")!),
                uuid: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!),
                base64: Optional("SGVsbG8gd29ybGQh"),
                list: Optional([
                    "list",
                    "list"
                ]),
                set: Optional([]),
                map: Optional([
                    1: "map"
                ]),
                bigint: Optional("1000000")
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(
            request: [
                NestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: ObjectWithOptionalField(
                        string: "string",
                        integer: 1,
                        long: 1000000,
                        double: 1.1,
                        bool: true,
                        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        date: CalendarDate("2023-01-15")!,
                        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                        base64: "SGVsbG8gd29ybGQh",
                        list: [
                            "list",
                            "list"
                        ],
                        map: [
                            1: "map"
                        ]
                    )
                ),
                NestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: ObjectWithOptionalField(
                        string: "string",
                        integer: 1,
                        long: 1000000,
                        double: 1.1,
                        bool: true,
                        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        date: CalendarDate("2023-01-15")!,
                        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                        base64: "SGVsbG8gd29ybGQh",
                        list: [
                            "list",
                            "list"
                        ],
                        map: [
                            1: "map"
                        ]
                    )
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithUnknownField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "unknown": {
                    "$ref": "https://example.com/schema"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithUnknownField(
            unknown: JSONValue.object(
                [
                    "$ref": JSONValue.string("https://example.com/schema")
                ]
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithUnknownField(
            request: ObjectWithUnknownField(
                unknown: .object([
                    "$ref": .string("https://example.com/schema")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithUnknownField2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "unknown": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithUnknownField(
            unknown: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithUnknownField(
            request: ObjectWithUnknownField(
                unknown: .object([
                    "key": .string("value")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithDocumentedUnknownType1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "documentedUnknownType": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithDocumentedUnknownType(
            documentedUnknownType: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithDocumentedUnknownType(
            request: ObjectWithDocumentedUnknownType(
                documentedUnknownType: .object([
                    "key": .string("value")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfDocumentedUnknownType1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": {
                    "key": "value"
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        ]
        let response = try await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType(
            request: [
                "string": .object([
                    "key": .string("value")
                ])
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithMixedRequiredAndOptionalFields1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "requiredString": "hello",
                  "requiredInteger": 0,
                  "optionalString": "world",
                  "requiredLong": 0
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithMixedRequiredAndOptionalFields(
            requiredString: "hello",
            requiredInteger: 0,
            optionalString: Optional("world"),
            requiredLong: 0
        )
        let response = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(
            request: ObjectWithMixedRequiredAndOptionalFields(
                requiredString: "hello",
                requiredInteger: 0,
                optionalString: "world",
                requiredLong: 0
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithMixedRequiredAndOptionalFields2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "requiredString": "requiredString",
                  "requiredInteger": 1,
                  "optionalString": "optionalString",
                  "requiredLong": 1000000
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithMixedRequiredAndOptionalFields(
            requiredString: "requiredString",
            requiredInteger: 1,
            optionalString: Optional("optionalString"),
            requiredLong: 1000000
        )
        let response = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(
            request: ObjectWithMixedRequiredAndOptionalFields(
                requiredString: "requiredString",
                requiredInteger: 1,
                optionalString: "optionalString",
                requiredLong: 1000000
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithRequiredNestedObject1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "requiredString": "hello",
                  "requiredObject": {
                    "string": "nested",
                    "NestedObject": {}
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithRequiredNestedObject(
            requiredString: "hello",
            requiredObject: NestedObjectWithRequiredField(
                string: "nested",
                nestedObject: ObjectWithOptionalField(

                )
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithRequiredNestedObject(
            request: ObjectWithRequiredNestedObject(
                requiredString: "hello",
                requiredObject: NestedObjectWithRequiredField(
                    string: "nested",
                    nestedObject: ObjectWithOptionalField(

                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithRequiredNestedObject2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "requiredString": "requiredString",
                  "requiredObject": {
                    "string": "string",
                    "NestedObject": {
                      "string": "string",
                      "integer": 1,
                      "long": 1000000,
                      "double": 1.1,
                      "bool": true,
                      "datetime": "2024-01-15T09:30:00Z",
                      "date": "2023-01-15",
                      "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                      "base64": "SGVsbG8gd29ybGQh",
                      "list": [
                        "list",
                        "list"
                      ],
                      "set": [
                        "set"
                      ],
                      "map": {
                        "1": "map"
                      },
                      "bigint": "1000000"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithRequiredNestedObject(
            requiredString: "requiredString",
            requiredObject: NestedObjectWithRequiredField(
                string: "string",
                nestedObject: ObjectWithOptionalField(
                    string: Optional("string"),
                    integer: Optional(1),
                    long: Optional(1000000),
                    double: Optional(1.1),
                    bool: Optional(true),
                    datetime: Optional(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    date: Optional(CalendarDate("2023-01-15")!),
                    uuid: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!),
                    base64: Optional("SGVsbG8gd29ybGQh"),
                    list: Optional([
                        "list",
                        "list"
                    ]),
                    set: Optional([]),
                    map: Optional([
                        1: "map"
                    ]),
                    bigint: Optional("1000000")
                )
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithRequiredNestedObject(
            request: ObjectWithRequiredNestedObject(
                requiredString: "requiredString",
                requiredObject: NestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: ObjectWithOptionalField(
                        string: "string",
                        integer: 1,
                        long: 1000000,
                        double: 1.1,
                        bool: true,
                        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        date: CalendarDate("2023-01-15")!,
                        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                        base64: "SGVsbG8gd29ybGQh",
                        list: [
                            "list",
                            "list"
                        ],
                        map: [
                            1: "map"
                        ]
                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithDatetimeLikeString1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "datetimeLikeString": "2023-08-31T14:15:22Z",
                  "actualDatetime": "2023-08-31T14:15:22Z"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithDatetimeLikeString(
            datetimeLikeString: "2023-08-31T14:15:22Z",
            actualDatetime: try! Date("2023-08-31T14:15:22Z", strategy: .iso8601)
        )
        let response = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(
            request: ObjectWithDatetimeLikeString(
                datetimeLikeString: "2023-08-31T14:15:22Z",
                actualDatetime: try! Date("2023-08-31T14:15:22Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithDatetimeLikeString2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "datetimeLikeString": "datetimeLikeString",
                  "actualDatetime": "2024-01-15T09:30:00Z"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
        let response = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(
            request: ObjectWithDatetimeLikeString(
                datetimeLikeString: "datetimeLikeString",
                actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}