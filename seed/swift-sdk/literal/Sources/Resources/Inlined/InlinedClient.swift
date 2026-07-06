import Foundation

public final class InlinedClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Literal
    /// 
    /// private func main() async throws {
    ///     let client = LiteralClient()
    /// 
    ///     _ = try await client.inlined.send(request: .init(
    ///         prompt: .youAreAHelpfulAssistant,
    ///         context: .youreSuperWise,
    ///         query: "What is the weather today",
    ///         temperature: 10.1,
    ///         stream: false,
    ///         aliasedContext: .youreSuperWise,
    ///         maybeContext: .youreSuperWise,
    ///         objectWithLiteral: ATopLevelLiteral(
    ///             nestedLiteral: ANestedLiteral(
    ///                 myLiteral: .howSuperCool
    ///             )
    ///         )
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(request: Requests.SendLiteralsInlinedRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inlined",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}