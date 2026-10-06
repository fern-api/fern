import QueryParameters
import Foundation
import Testing

@Suite("Client Additional Body Parameters Tests") struct ClientAdditionalBodyParametersTests {

    @Test func testAdditionalBodyPropertiesAreNotSentForGetRequests() async throws {
        let stub = HTTPStub()
        stub.setResponse(body: Foundation.Data("{}".utf8))
        let additionalBodyParameters: [String: String]? = ["fernExtraString": "beta"]
        let additionalBodyProperties: [String: JSONValue]? = ["fernExtraBool": true]

        let client = QueryParametersClient(
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
