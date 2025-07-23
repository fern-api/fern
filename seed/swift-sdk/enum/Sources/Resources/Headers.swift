public final class HeadersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/headers",
            headers: [
                "operand": operand, 
                "maybeOperand": maybeOperand, 
                "operandOrColor": operandOrColor, 
                "maybeOperandOrColor": maybeOperandOrColor
            ],
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }
}