import Foundation

public final class QueryparamClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: Color, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "operand": .string(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .string($0.rawValue) }, 
                "operandOrColor": .string(operandOrColor.rawValue), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }

    public func sendlist(operand: Operand? = nil, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand? = nil, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query-list",
            queryParams: [
                "operand": operand.map { .string($0.rawValue) }, 
                "maybeOperand": maybeOperand.map { .string($0.rawValue) }, 
                "operandOrColor": operandOrColor.map { .unknown($0) }, 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }
}