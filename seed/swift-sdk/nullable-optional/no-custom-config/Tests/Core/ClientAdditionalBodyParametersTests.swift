import NullableOptional
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

        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.nullableOptional.createUser(
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

        let client = NullableOptionalClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.nullableOptional.getUser(
                userId: "userId",
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
