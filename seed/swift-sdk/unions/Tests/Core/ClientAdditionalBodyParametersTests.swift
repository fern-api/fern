import Unions
import Foundation
import Testing

@Suite("Client Additional Body Parameters Tests") struct ClientAdditionalBodyParametersTests {

    @Test func testAdditionalBodyPropertiesAreNotSentForGetRequests() async throws {
        let stub = HTTPStub()
        stub.setResponse(body: Foundation.Data("{}".utf8))
        let additionalBodyParameters: [String: String]? = ["fernExtraString": "beta"]
        let additionalBodyProperties: [String: JSONValue]? = ["fernExtraBool": true]

        let client = UnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.bigunion.get(
                id: "id",
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
