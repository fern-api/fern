import Foundation

public final class ReferenceClient: Sendable {
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
    ///     _ = try await client.reference.send(request: SendRequest(
    ///         prompt: .youAreAHelpfulAssistant,
    ///         query: "What is the weather today",
    ///         stream: false,
    ///         ending: .ending,
    ///         context: .youreSuperWise,
    ///         containerObject: ContainerObject(
    ///             nestedObjects: [
    ///                 NestedObjectWithLiterals(
    ///                     literal1: .literal1,
    ///                     literal2: .literal2,
    ///                     strProp: "strProp"
    ///                 )
    ///             ]
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(request: SendRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/reference",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}