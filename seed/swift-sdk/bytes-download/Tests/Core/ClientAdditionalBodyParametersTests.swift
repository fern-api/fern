import BytesDownload
import Foundation
import Testing

@Suite("Client Additional Body Parameters Tests") struct ClientAdditionalBodyParametersTests {

    @Test func testAdditionalBodyParametersCreateBodyWhenEndpointHasNoBody() async throws {
        let additionalBodyParameters: [String: JSONValue] = [
            "fernExtraString": "beta",
            "fernExtraNested": ["enabled": true, "values": [1, 2, 3]],
        ]
        let body = try await captureNoBodyEndpointBody(additionalBodyParameters: additionalBodyParameters)
        try #require(body == additionalBodyParameters)
    }

    @Test func testNoBodyIsSentWithoutAdditionalBodyParameters() async throws {
        let body = try await captureNoBodyEndpointBody(additionalBodyParameters: nil)
        try #require(body == nil)
    }

    private func captureNoBodyEndpointBody(additionalBodyParameters: [String: JSONValue]?) async throws
        -> [String: JSONValue]?
    {
        let stub = HTTPStub()
        stub.setResponse(body: Foundation.Data("{}".utf8))

        let client = BytesDownloadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.simple(requestOptions: RequestOptions(additionalHeaders: stub.headers, additionalBodyParameters: additionalBodyParameters))

        } catch {
        }
        let request = try #require(stub.takeLastRequest())
        return try decodeJSONObjectBody(of: request)
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
