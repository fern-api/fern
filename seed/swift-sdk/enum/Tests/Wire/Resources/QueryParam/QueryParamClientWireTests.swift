import Foundation
import Testing
import Enum

@Suite("QueryParamClient Wire Tests") struct QueryParamClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = EnumClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.queryParam.send(
            operand: .greaterThan,
            operandOrColor: ColorOrOperand.color(
                .red
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func sendList1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = EnumClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.queryParam.sendList(
            operand: [
                .greaterThan
            ],
            maybeOperand: [
                .greaterThan
            ],
            operandOrColor: [
                ColorOrOperand.color(
                    .red
                )
            ],
            maybeOperandOrColor: [
                ColorOrOperand.color(
                    .red
                )
            ],
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}