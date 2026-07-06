import Foundation

public final class InlinedRequestClient: Sendable {
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
    ///     _ = try await client.inlinedRequest.send(request: .init(
    ///         operand: .greaterThan,
    ///         operandOrColor: ColorOrOperand.color(
    ///             .red
    ///         )
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(request: Requests.SendEnumInlinedRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inlined",
            body: request,
            requestOptions: requestOptions
        )
    }
}