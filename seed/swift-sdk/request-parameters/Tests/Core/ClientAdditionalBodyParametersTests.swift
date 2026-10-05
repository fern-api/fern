import RequestParameters
import Foundation
import Testing

@Suite("Client Additional Body Parameters Tests") struct ClientAdditionalBodyParametersTests {
    @Test func testAdditionalBodyPropertiesAreMergedIntoJSONBody() async throws {
        let baselineBody = try #require(try await captureJSONBody())
        let additionalBodyProperties: [String: JSONValue] = [
            "fernExtraString": "beta",
            "fernExtraBool": true,
            "fernExtraNumber": 42,
            "fernExtraNull": .null,
            "fernExtraNested": [
                "enabled": false,
                "values": [1.5, "two", ["three": 3]],
            ],
        ]
        let mergedBody = try #require(
            try await captureJSONBody(additionalBodyProperties: additionalBodyProperties))
        let expectedBody = baselineBody.merging(additionalBodyProperties) { _, extra in extra }
        try #require(mergedBody == expectedBody)
    }

    @Test func testAdditionalBodyPropertiesOverrideGeneratedFields() async throws {
        let baselineBody = try #require(try await captureJSONBody())
        let overriddenKey = try #require(baselineBody.keys.sorted().first)
        let mergedBody = try #require(
            try await captureJSONBody(additionalBodyProperties: [overriddenKey: "fern-override"]))
        var expectedBody = baselineBody
        expectedBody[overriddenKey] = "fern-override"
        try #require(mergedBody == expectedBody)
    }

    @Test func testEmptyAdditionalBodyPropertiesLeaveJSONBodyUnchanged() async throws {
        let baselineBody = try await captureJSONBody()
        let bodyWithEmptyAdditionalProperties = try await captureJSONBody(
            additionalBodyParameters: [:], additionalBodyProperties: [:])
        try #require(baselineBody == bodyWithEmptyAdditionalProperties)
    }

    @Test func testAdditionalBodyParametersAreMergedAsJSONStrings() async throws {
        let baselineBody = try #require(try await captureJSONBody())
        let additionalBodyParameters: [String: String] = [
            "fernExtraString": "beta",
            "fernExtraFlag": "true",
        ]
        let mergedBody = try #require(
            try await captureJSONBody(additionalBodyParameters: additionalBodyParameters))
        let expectedBody = baselineBody.merging(additionalBodyParameters.mapValues(JSONValue.string)) { _, extra in
            extra
        }
        try #require(mergedBody == expectedBody)
    }

    @Test func testAdditionalBodyParametersOverrideGeneratedFields() async throws {
        let baselineBody = try #require(try await captureJSONBody())
        let overriddenKey = try #require(baselineBody.keys.sorted().first)
        let mergedBody = try #require(
            try await captureJSONBody(additionalBodyParameters: [overriddenKey: "fern-override"]))
        var expectedBody = baselineBody
        expectedBody[overriddenKey] = .string("fern-override")
        try #require(mergedBody == expectedBody)
    }

    @Test func testAdditionalBodyPropertiesTakePrecedenceOverAdditionalBodyParameters() async throws {
        let baselineBody = try #require(try await captureJSONBody())
        let mergedBody = try #require(
            try await captureJSONBody(
                additionalBodyParameters: ["fernShared": "from-parameters", "fernOnlyParameters": "a"],
                additionalBodyProperties: ["fernShared": true, "fernOnlyProperties": 1]
            ))
        var expectedBody = baselineBody
        expectedBody["fernShared"] = .bool(true)
        expectedBody["fernOnlyParameters"] = .string("a")
        expectedBody["fernOnlyProperties"] = .number(1)
        try #require(mergedBody == expectedBody)
    }

    private func captureJSONBody(
        additionalBodyParameters: [String: String]? = nil,
        additionalBodyProperties: [String: JSONValue]? = nil
    ) async throws -> [String: JSONValue]? {
        let stub = HTTPStub()
        stub.setResponse(body: Foundation.Data("{}".utf8))

        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.user.createUsername(
                tags: [
                    "tags",
                    "tags"
                ],
                request: .init(
                    username: "username",
                    password: "password",
                    name: "test"
                ),
                requestOptions: RequestOptions(additionalHeaders: stub.headers, additionalBodyParameters: additionalBodyParameters, additionalBodyProperties: additionalBodyProperties)
            )

        } catch {
        }
        let request = try #require(stub.takeLastRequest())
        return try decodeJSONObjectBody(of: request)
    }

    @Test func testAdditionalBodyPropertiesAreNotSentForGetRequests() async throws {
        let stub = HTTPStub()
        stub.setResponse(body: Foundation.Data("{}".utf8))
        let additionalBodyParameters: [String: String]? = ["fernExtraString": "beta"]
        let additionalBodyProperties: [String: JSONValue]? = ["fernExtraBool": true]

        let client = RequestParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.user.getUsername(
                limit: 1,
                id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                date: CalendarDate("2023-01-15")!,
                deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                bytes: "SGVsbG8gd29ybGQh",
                user: User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                ),
                userList: [
                    User(
                        name: "name",
                        tags: [
                            "tags",
                            "tags"
                        ]
                    ),
                    User(
                        name: "name",
                        tags: [
                            "tags",
                            "tags"
                        ]
                    )
                ],
                optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                keyValue: [
                    "keyValue": "keyValue"
                ],
                optionalString: "optionalString",
                nestedUser: NestedUser(
                    name: "name",
                    user: User(
                        name: "name",
                        tags: [
                            "tags",
                            "tags"
                        ]
                    )
                ),
                optionalUser: User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                ),
                excludeUser: [
                    User(
                        name: "name",
                        tags: [
                            "tags",
                            "tags"
                        ]
                    )
                ],
                filter: [
                    "filter"
                ],
                longParam: 1000000,
                bigIntParam: "1000000",
                requestOptions: RequestOptions(additionalHeaders: stub.headers, additionalBodyParameters: additionalBodyParameters, additionalBodyProperties: additionalBodyProperties)
            )

        } catch {
        }
        let request = try #require(stub.takeLastRequest())
        try #require(readBody(of: request) == nil)
    }

    private func decodeJSONObjectBody(of request: Networking.URLRequest) throws -> [String: JSONValue]? {
        guard let body = readBody(of: request), !body.isEmpty else {
            return nil
        }
        return try Foundation.JSONDecoder().decode([String: JSONValue].self, from: body)
    }

    private func readBody(of request: Networking.URLRequest) -> Foundation.Data? {
        if let body = request.httpBody {
            return body
        }
        guard let stream = request.httpBodyStream else {
            return nil
        }
        stream.open()
        defer { stream.close() }
        var data = Foundation.Data()
        let bufferSize = 4096
        var buffer = [UInt8](repeating: 0, count: bufferSize)
        while stream.hasBytesAvailable {
            let count = stream.read(&buffer, maxLength: bufferSize)
            if count <= 0 {
                break
            }
            data.append(buffer, count: count)
        }
        return data
    }
}
