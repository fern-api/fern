import Foundation
import Testing
import Enum

@Suite("InlinedRequestClient Wire Tests") struct InlinedRequestClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = EnumClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.inlinedRequest.send(
            request: .init(
                operand: .greaterThan,
                operandOrColor: ColorOrOperand.color(
                    .red
                )
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}