import Foundation
import Testing
import Api

@Suite("ObjectClient Wire Tests") struct ObjectClientWireTests {
    @Test func getAndReturnWithOptionalField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string",
                  "integer": 1,
                  "long": 1000000,
                  "double": 1.1,
                  "bool": true,
                  "datetime": "2024-01-15T09:30:00Z",
                  "date": "2023-01-15",
                  "uuid": "uuid",
                  "base64": "base64",
                  "list": [
                    "list"
                  ],
                  "set": [
                    "set"
                  ],
                  "map": {
                    "key": "value"
                  },
                  "bigint": 1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithOptionalField(
            string: Optional(Nullable<String>.value("string")),
            integer: Optional(Nullable<Int>.value(1)),
            long: Optional(Nullable<Int64>.value(1000000)),
            double: Optional(Nullable<Double>.value(1.1)),
            bool: Optional(Nullable<Bool>.value(true)),
            datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
            uuid: Optional(Nullable<String>.value("uuid")),
            base64: Optional(Nullable<String>.value("base64")),
            list: Optional(Nullable<[String]>.value([
                "list"
            ])),
            set: Optional(Nullable<[String]>.value([
                "set"
            ])),
            map: Optional(Nullable<[String: Nullable<String>]>.value([
                "key": Nullable<String>.value("value")
            ])),
            bigint: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.endpoints.object.getAndReturnWithOptionalField(
            request: TypesObjectWithOptionalField(

            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithOptionalField2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string",
                  "integer": 1,
                  "long": 1000000,
                  "double": 1.1,
                  "bool": true,
                  "datetime": "2024-01-15T09:30:00Z",
                  "date": "2023-01-15",
                  "uuid": "uuid",
                  "base64": "base64",
                  "list": [
                    "list",
                    "list"
                  ],
                  "set": [
                    "set",
                    "set"
                  ],
                  "map": {
                    "map": "map"
                  },
                  "bigint": 1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithOptionalField(
            string: Optional(Nullable<String>.value("string")),
            integer: Optional(Nullable<Int>.value(1)),
            long: Optional(Nullable<Int64>.value(1000000)),
            double: Optional(Nullable<Double>.value(1.1)),
            bool: Optional(Nullable<Bool>.value(true)),
            datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
            date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
            uuid: Optional(Nullable<String>.value("uuid")),
            base64: Optional(Nullable<String>.value("base64")),
            list: Optional(Nullable<[String]>.value([
                "list",
                "list"
            ])),
            set: Optional(Nullable<[String]>.value([
                "set",
                "set"
            ])),
            map: Optional(Nullable<[String: Nullable<String>]>.value([
                "map": Nullable<String>.value("map")
            ])),
            bigint: Optional(Nullable<Int>.value(1))
        )
        let response = try await client.endpoints.object.getAndReturnWithOptionalField(
            request: TypesObjectWithOptionalField(
                string: .value("string"),
                integer: .value(1),
                long: .value(1000000),
                double: .value(1.1),
                bool: .value(true),
                datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                date: .value(CalendarDate("2023-01-15")!),
                uuid: .value("uuid"),
                base64: .value("base64"),
                list: .value([
                    "list",
                    "list"
                ]),
                set: .value([
                    "set",
                    "set"
                ]),
                map: .value([
                    "map": .value("map")
                ]),
                bigint: .value(1)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithRequiredField1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpoints.object.getAndReturnWithRequiredField(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithRequiredField2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpoints.object.getAndReturnWithRequiredField(
            request: TypesObjectWithRequiredField(
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
                #"""
                {
                  "map": {
                    "key": {
                      "key": "value"
                    }
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithMapOfMap(
            map: [
                "key": [
                    "key": "value"
                ]
            ]
        )
        let response = try await client.endpoints.object.getAndReturnWithMapOfMap(
            request: TypesObjectWithMapOfMap(
                map: [
                    "key": [
                        "key": "value"
                    ]
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithMapOfMap2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "map": {
                    "map": {
                      "map": "map"
                    }
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithMapOfMap(
            map: [
                "map": [
                    "map": "map"
                ]
            ]
        )
        let response = try await client.endpoints.object.getAndReturnWithMapOfMap(
            request: TypesObjectWithMapOfMap(
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
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "key": "value"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithOptionalField(
            string: Optional(Nullable<String>.value("string")),
            nestedObject: Optional(TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "key": Nullable<String>.value("value")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            ))
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithOptionalField(
            request: TypesNestedObjectWithOptionalField(

            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithOptionalField2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set",
                      "set"
                    ],
                    "map": {
                      "map": "map"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithOptionalField(
            string: Optional(Nullable<String>.value("string")),
            nestedObject: Optional(TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list",
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set",
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "map": Nullable<String>.value("map")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            ))
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithOptionalField(
            request: TypesNestedObjectWithOptionalField(
                string: .value("string"),
                nestedObject: TypesObjectWithOptionalField(
                    string: .value("string"),
                    integer: .value(1),
                    long: .value(1000000),
                    double: .value(1.1),
                    bool: .value(true),
                    datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    date: .value(CalendarDate("2023-01-15")!),
                    uuid: .value("uuid"),
                    base64: .value("base64"),
                    list: .value([
                        "list",
                        "list"
                    ]),
                    set: .value([
                        "set",
                        "set"
                    ]),
                    map: .value([
                        "map": .value("map")
                    ]),
                    bigint: .value(1)
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
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "key": "value"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "key": Nullable<String>.value("value")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
            string: "string",
            request: TypesNestedObjectWithRequiredField(
                string: "string",
                nestedObject: TypesObjectWithOptionalField(

                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithRequiredField2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set",
                      "set"
                    ],
                    "map": {
                      "map": "map"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list",
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set",
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "map": Nullable<String>.value("map")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
            string: "string",
            request: TypesNestedObjectWithRequiredField(
                string: "string",
                nestedObject: TypesObjectWithOptionalField(
                    string: .value("string"),
                    integer: .value(1),
                    long: .value(1000000),
                    double: .value(1.1),
                    bool: .value(true),
                    datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    date: .value(CalendarDate("2023-01-15")!),
                    uuid: .value("uuid"),
                    base64: .value("base64"),
                    list: .value([
                        "list",
                        "list"
                    ]),
                    set: .value([
                        "set",
                        "set"
                    ]),
                    map: .value([
                        "map": .value("map")
                    ]),
                    bigint: .value(1)
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
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list"
                    ],
                    "set": [
                      "set"
                    ],
                    "map": {
                      "key": "value"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "key": Nullable<String>.value("value")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(
            request: [
                TypesNestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: TypesObjectWithOptionalField(

                    )
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnNestedWithRequiredFieldAsList2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
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
                    "uuid": "uuid",
                    "base64": "base64",
                    "list": [
                      "list",
                      "list"
                    ],
                    "set": [
                      "set",
                      "set"
                    ],
                    "map": {
                      "map": "map"
                    },
                    "bigint": 1
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(
                string: Optional(Nullable<String>.value("string")),
                integer: Optional(Nullable<Int>.value(1)),
                long: Optional(Nullable<Int64>.value(1000000)),
                double: Optional(Nullable<Double>.value(1.1)),
                bool: Optional(Nullable<Bool>.value(true)),
                datetime: Optional(Nullable<Date>.value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))),
                date: Optional(Nullable<CalendarDate>.value(CalendarDate("2023-01-15")!)),
                uuid: Optional(Nullable<String>.value("uuid")),
                base64: Optional(Nullable<String>.value("base64")),
                list: Optional(Nullable<[String]>.value([
                    "list",
                    "list"
                ])),
                set: Optional(Nullable<[String]>.value([
                    "set",
                    "set"
                ])),
                map: Optional(Nullable<[String: Nullable<String>]>.value([
                    "map": Nullable<String>.value("map")
                ])),
                bigint: Optional(Nullable<Int>.value(1))
            )
        )
        let response = try await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(
            request: [
                TypesNestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: TypesObjectWithOptionalField(
                        string: .value("string"),
                        integer: .value(1),
                        long: .value(1000000),
                        double: .value(1.1),
                        bool: .value(true),
                        datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        date: .value(CalendarDate("2023-01-15")!),
                        uuid: .value("uuid"),
                        base64: .value("base64"),
                        list: .value([
                            "list",
                            "list"
                        ]),
                        set: .value([
                            "set",
                            "set"
                        ]),
                        map: .value([
                            "map": .value("map")
                        ]),
                        bigint: .value(1)
                    )
                ),
                TypesNestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: TypesObjectWithOptionalField(
                        string: .value("string"),
                        integer: .value(1),
                        long: .value(1000000),
                        double: .value(1.1),
                        bool: .value(true),
                        datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                        date: .value(CalendarDate("2023-01-15")!),
                        uuid: .value("uuid"),
                        base64: .value("base64"),
                        list: .value([
                            "list",
                            "list"
                        ]),
                        set: .value([
                            "set",
                            "set"
                        ]),
                        map: .value([
                            "map": .value("map")
                        ]),
                        bigint: .value(1)
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
                #"""
                {
                  "unknown": {
                    "key": "value"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithUnknownField(
            unknown: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithUnknownField(
            request: TypesObjectWithUnknownField(
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
                #"""
                {
                  "documentedUnknownType": {
                    "key": "value"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithDocumentedUnknownType(
            documentedUnknownType: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        )
        let response = try await client.endpoints.object.getAndReturnWithDocumentedUnknownType(
            request: TypesObjectWithDocumentedUnknownType(
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
                #"""
                {
                  "key": {
                    "key": "value"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "key": JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )
        ]
        let response = try await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType(
            request: [:],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfDocumentedUnknownType2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": {
                    "key": "value"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
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

    @Test func getAndReturnWithDatetimeLikeString1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "datetimeLikeString": "datetimeLikeString",
                  "actualDatetime": "2024-01-15T09:30:00Z"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
        let response = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(
            request: TypesObjectWithDatetimeLikeString(
                datetimeLikeString: "datetimeLikeString",
                actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnWithDatetimeLikeString2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "datetimeLikeString": "datetimeLikeString",
                  "actualDatetime": "2024-01-15T09:30:00Z"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
        let response = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(
            request: TypesObjectWithDatetimeLikeString(
                datetimeLikeString: "datetimeLikeString",
                actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}