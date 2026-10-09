import Foundation

public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.get(request: MyUnion.string(
    ///         "string"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(request: MyUnion, requestOptions: RequestOptions? = nil) async throws -> MyUnion {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: MyUnion.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.getMetadata()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get,
            path: "/metadata",
            requestOptions: requestOptions,
            responseType: Metadata.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.updateMetadata(request: MetadataUnion.optionalMetadata(
    ///         [
    ///             "string": .object([
    ///                 "key": .string("value")
    ///             ])
    ///         ]
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateMetadata(request: MetadataUnion, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .put,
            path: "/metadata",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.call(request: Request(
    ///         union: MetadataUnion.optionalMetadata(
    ///             [
    ///                 "string": .object([
    ///                     "key": .string("value")
    ///                 ])
    ///             ]
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func call(request: Request, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/call",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.duplicateTypesUnion(request: UnionWithDuplicateTypes.string(
    ///         "string"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func duplicateTypesUnion(request: UnionWithDuplicateTypes, requestOptions: RequestOptions? = nil) async throws -> UnionWithDuplicateTypes {
        return try await httpClient.performRequest(
            method: .post,
            path: "/duplicate",
            body: request,
            requestOptions: requestOptions,
            responseType: UnionWithDuplicateTypes.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.nestedUnions(request: NestedUnionRoot.string(
    ///         "string"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func nestedUnions(request: NestedUnionRoot, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/nested",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.nestedObjectUnions(request: OuterNestedUnion.string(
    ///         "string"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func nestedObjectUnions(request: OuterNestedUnion, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/nested-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.aliasedObjectUnion(request: AliasedObjectUnion.aliasedLeafA(
    ///         LeafObjectA(
    ///             onlyInA: "onlyInA",
    ///             sharedNumber: 1
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func aliasedObjectUnion(request: AliasedObjectUnion, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/aliased-object",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.getWithBaseProperties(request: UnionWithBaseProperties.namedMetadata(
    ///         NamedMetadata(
    ///             name: "name",
    ///             value: [
    ///                 "value": .object([
    ///                     "key": .string("value")
    ///                 ])
    ///             ]
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBaseProperties(request: UnionWithBaseProperties, requestOptions: RequestOptions? = nil) async throws -> UnionWithBaseProperties {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-base-properties",
            body: request,
            requestOptions: requestOptions,
            responseType: UnionWithBaseProperties.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UndiscriminatedUnions
    ///
    /// private func main() async throws {
    ///     let client = UndiscriminatedUnionsClient()
    ///
    ///     _ = try await client.union.testCamelCaseProperties(request: .init(paymentMethod: PaymentMethodUnion.tokenizeCard(
    ///         TokenizeCard(
    ///             method: "card",
    ///             cardNumber: "1234567890123456"
    ///         )
    ///     )))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func testCamelCaseProperties(request: Requests.PaymentRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/camel-case",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}