import Foundation

public final class QueryParamClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Enum
    ///
    /// private func main() async throws {
    ///     let client = EnumClient()
    ///
    ///     _ = try await client.queryParam.send(
    ///         operand: .greaterThan,
    ///         operandOrColor: ColorOrOperand.color(
    ///             .red
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(operand: Operand, maybeOperand: Operand? = nil, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "operand": .string(operand.rawValue), 
                "maybeOperand": maybeOperand.map { .string($0.rawValue) }, 
                "operandOrColor": .unknown(operandOrColor), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Enum
    ///
    /// private func main() async throws {
    ///     let client = EnumClient()
    ///
    ///     _ = try await client.queryParam.sendList(
    ///         operand: [
    ///             .greaterThan
    ///         ],
    ///         maybeOperand: [
    ///             .greaterThan
    ///         ],
    ///         operandOrColor: [
    ///             ColorOrOperand.color(
    ///                 .red
    ///             )
    ///         ],
    ///         maybeOperandOrColor: [
    ///             ColorOrOperand.color(
    ///                 .red
    ///             )
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendList(operand: [Operand], maybeOperand: [Operand]? = nil, operandOrColor: [ColorOrOperand], maybeOperandOrColor: [ColorOrOperand]? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query-list",
            queryParams: [
                "operand": .unknown(operand), 
                "maybeOperand": maybeOperand.map { .unknown($0) }, 
                "operandOrColor": .unknown(operandOrColor), 
                "maybeOperandOrColor": maybeOperandOrColor.map { .unknown($0) }
            ],
            requestOptions: requestOptions
        )
    }
}