public final class QueryParamClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/query", 
            queryParams: [
                "operand": .string(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .string($0) }, 
                "operandOrColor": .string(operandOrColor.rawValue), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func sendList(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/query-list", 
            queryParams: [
                "operand": .string(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .string($0) }, 
                "operandOrColor": .string(operandOrColor.rawValue), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }
}