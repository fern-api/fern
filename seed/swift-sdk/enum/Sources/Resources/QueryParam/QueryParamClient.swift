import Foundation

public final class QueryParamClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "operand": .unknown(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .unknown($0.rawValue) }, 
                "operandOrColor": .unknown(operandOrColor), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }

    public func sendList(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query-list",
            queryParams: [
                "operand": .unknown(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .unknown($0.rawValue) }, 
                "operandOrColor": .unknown(operandOrColor), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }
}