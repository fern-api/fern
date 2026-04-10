import Foundation
import Testing
import Api

@Suite("InlinedrequestsClient Wire Tests") struct InlinedrequestsClientWireTests {
    @Test func postwithobjectbodyandresponse1() async throws -> Void {
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
        let response = try await client.inlinedrequests.postwithobjectbodyandresponse(
            request: .init(
                string: "string",
                integer: 1,
                nestedObject: TypesObjectWithOptionalField(

                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func postwithobjectbodyandresponse2() async throws -> Void {
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
        let response = try await client.inlinedrequests.postwithobjectbodyandresponse(
            request: .init(
                string: "string",
                integer: 1,
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
}