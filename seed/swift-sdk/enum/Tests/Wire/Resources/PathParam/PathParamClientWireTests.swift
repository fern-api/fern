import Foundation
import Testing
import Enum

@Suite("PathParamClient Wire Tests") struct PathParamClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = EnumClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.pathParam.send(
            operand: ">",
            operandOrColor: "red",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}