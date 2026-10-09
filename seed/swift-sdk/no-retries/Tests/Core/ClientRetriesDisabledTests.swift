import NoRetries
import Foundation
import Testing

@Suite("Client Retries Disabled Tests") struct ClientRetriesDisabledTests {
    @Test func testDoesNotRetryOn500InternalServerError() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Foundation.Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Foundation.Data("true".utf8)
            ),
        ])

        let client = NoRetriesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.retries.getUsers(requestOptions: RequestOptions(additionalHeaders: stub.headers))

        } catch {
        }
        try #require(stub.getRequestCount() == 1)
    }

    @Test func testIgnoresRequestLevelMaxRetries() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Foundation.Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Foundation.Data("true".utf8)
            ),
        ])

        let client = NoRetriesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.retries.getUsers(requestOptions: RequestOptions(maxRetries: 5, additionalHeaders: stub.headers))

        } catch {
        }
        try #require(stub.getRequestCount() == 1)
    }
}
