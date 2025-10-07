import Foundation
import Testing
import Exhaustive

@Suite("HttpMethodsClient Wire Tests") struct HttpMethodsClientWireTests {
    @Test func testGet1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.endpoints.httpMethods.testGet(id: "id")
        try #require(response == expectedResponse)
    }

    @Test func testPost1() async throws -> Void {
        let stub = WireStub()
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
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: try! CalendarDate("2023-01-15"),
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            set: [],
            map: [
                1: "map"
            ],
            bigint: "1000000"
        )
        let response = try await client.endpoints.httpMethods.testPost(request: ObjectWithRequiredField(
            string: "string"
        ))
        try #require(response == expectedResponse)
    }

    @Test func testPut1() async throws -> Void {
        let stub = WireStub()
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
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: try! CalendarDate("2023-01-15"),
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            set: [],
            map: [
                1: "map"
            ],
            bigint: "1000000"
        )
        let response = try await client.endpoints.httpMethods.testPut(
            id: "id",
            request: ObjectWithRequiredField(
                string: "string"
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func testPatch1() async throws -> Void {
        let stub = WireStub()
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
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: try! CalendarDate("2023-01-15"),
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            set: [],
            map: [
                1: "map"
            ],
            bigint: "1000000"
        )
        let response = try await client.endpoints.httpMethods.testPatch(
            id: "id",
            request: ObjectWithOptionalField(
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                date: try! CalendarDate("2023-01-15"),
                uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                base64: "SGVsbG8gd29ybGQh",
                list: [
                    "list",
                    "list"
                ],
                set: ,
                map: [
                    1: "map"
                ],
                bigint: 
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func testDelete1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.endpoints.httpMethods.testDelete(id: "id")
        try #require(response == expectedResponse)
    }
}