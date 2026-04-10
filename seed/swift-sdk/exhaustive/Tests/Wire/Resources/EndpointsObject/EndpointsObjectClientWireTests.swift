import Foundation
import Testing
import Api

@Suite("EndpointsObjectClient Wire Tests") struct EndpointsObjectClientWireTests {
    @Test func endpointsObjectGetAndReturnWithOptionalField1() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithOptionalField(
            request: TypesObjectWithOptionalField(

            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithOptionalField2() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithOptionalField(
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

    @Test func endpointsObjectGetAndReturnWithRequiredField1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredField(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithRequiredField2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredField(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithMapOfMap1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "map": {
                    "key": {
                      "key": "value"
                    }
                  }
                }
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap(
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

    @Test func endpointsObjectGetAndReturnWithMapOfMap2() async throws -> Void {
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap(
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

    @Test func endpointsObjectGetAndReturnNestedWithOptionalField1() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithOptionalField(
            request: TypesNestedObjectWithOptionalField(

            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnNestedWithOptionalField2() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithOptionalField(
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

    @Test func endpointsObjectGetAndReturnNestedWithRequiredField1() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField(
            string: "string",
            request: .init(body: TypesNestedObjectWithRequiredField(
                string: "string",
                nestedObject: TypesObjectWithOptionalField(

                )
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnNestedWithRequiredField2() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField(
            string: "string",
            request: .init(body: TypesNestedObjectWithRequiredField(
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
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnNestedWithRequiredFieldAsList1() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
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

    @Test func endpointsObjectGetAndReturnNestedWithRequiredFieldAsList2() async throws -> Void {
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
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
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

    @Test func endpointsObjectGetAndReturnWithUnknownField1() async throws -> Void {
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithUnknownField(
            request: TypesObjectWithUnknownField(
                unknown: .object([
                    "key": .string("value")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithDocumentedUnknownType1() async throws -> Void {
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithDocumentedUnknownType(
            request: TypesObjectWithDocumentedUnknownType(
                documentedUnknownType: .object([
                    "key": .string("value")
                ])
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnMapOfDocumentedUnknownType1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": {
                    "key": "value"
                  }
                }
                """.utf8
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
            request: [:],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnMapOfDocumentedUnknownType2() async throws -> Void {
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
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
            request: [
                "string": .object([
                    "key": .string("value")
                ])
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithMixedRequiredAndOptionalFields(
            requiredString: "requiredString",
            requiredInteger: 1,
            optionalString: Optional(Nullable<String>.value("optionalString")),
            requiredLong: 1000000
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
            request: TypesObjectWithMixedRequiredAndOptionalFields(
                requiredString: "requiredString",
                requiredInteger: 1,
                requiredLong: 1000000
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithMixedRequiredAndOptionalFields(
            requiredString: "requiredString",
            requiredInteger: 1,
            optionalString: Optional(Nullable<String>.value("optionalString")),
            requiredLong: 1000000
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
            request: TypesObjectWithMixedRequiredAndOptionalFields(
                requiredString: "requiredString",
                requiredInteger: 1,
                optionalString: .value("optionalString"),
                requiredLong: 1000000
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithRequiredNestedObject1() async throws -> Void {
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
                      "uuid": "uuid",
                      "base64": "base64",
                      "list": [
                        "list"
                      ],
                      "set": [
                        "set"
                      ],
                      "bigint": 1
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredNestedObject(
            requiredString: "requiredString",
            requiredObject: TypesNestedObjectWithRequiredField(
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
                    bigint: Optional(Nullable<Int>.value(1))
                )
            )
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject(
            request: TypesObjectWithRequiredNestedObject(
                requiredString: "requiredString",
                requiredObject: TypesNestedObjectWithRequiredField(
                    string: "string",
                    nestedObject: TypesObjectWithOptionalField(

                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithRequiredNestedObject2() async throws -> Void {
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
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredNestedObject(
            requiredString: "requiredString",
            requiredObject: TypesNestedObjectWithRequiredField(
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
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject(
            request: TypesObjectWithRequiredNestedObject(
                requiredString: "requiredString",
                requiredObject: TypesNestedObjectWithRequiredField(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithDatetimeLikeString1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString(
            request: TypesObjectWithDatetimeLikeString(
                datetimeLikeString: "datetimeLikeString",
                actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsObjectGetAndReturnWithDatetimeLikeString2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
        let response = try await client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString(
            request: TypesObjectWithDatetimeLikeString(
                datetimeLikeString: "datetimeLikeString",
                actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}