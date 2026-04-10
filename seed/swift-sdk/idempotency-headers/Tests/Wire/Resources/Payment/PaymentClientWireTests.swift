import Foundation
import Testing
import IdempotencyHeaders

@Suite("PaymentClient Wire Tests") struct PaymentClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32
                """.utf8
            )
        )
        let client = IdempotencyHeadersClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!
        let response = try await client.payment.create(
            request: .init(
                amount: 1,
                currency: .usd
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}