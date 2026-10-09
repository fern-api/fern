import <%= moduleName %>
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

<%= clientDeclaration %>
        do {
<%= endpointCall %>
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

<%= clientDeclaration %>
        do {
<%= endpointCallMaxRetries5 %>
        } catch {
        }
        try #require(stub.getRequestCount() == 1)
    }
}
