import Foundation

public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnListOfPrimitives(request: [
    ///         "string",
    ///         "string"
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnListOfPrimitives(request: [String], requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnListOfObjects(request: [
    ///         ObjectWithRequiredField(
    ///             string: "string"
    ///         ),
    ///         ObjectWithRequiredField(
    ///             string: "string"
    ///         )
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnListOfObjects(request: [ObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [ObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [ObjectWithRequiredField].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnSetOfPrimitives(request: .array([
    ///         .string("string")
    ///     ]))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnSetOfPrimitives(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnSetOfObjects(request: .array([
    ///         .object([
    ///             "string": .string("string")
    ///         ])
    ///     ]))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnSetOfObjects(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnMapPrimToPrim(request: [
    ///         "string": "string"
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnMapPrimToPrim(request: [String: String], requestOptions: RequestOptions? = nil) async throws -> [String: String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-prim",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: String].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnMapOfPrimToObject(request: [
    ///         "string": ObjectWithRequiredField(
    ///             string: "string"
    ///         )
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnMapOfPrimToObject(request: [String: ObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [String: ObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-object",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: ObjectWithRequiredField].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion(request: [
    ///         "string": MixedType.double(
    ///             1.1
    ///         )
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnMapOfPrimToUndiscriminatedUnion(request: [String: MixedType], requestOptions: RequestOptions? = nil) async throws -> [String: MixedType] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-union",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: MixedType].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.container.getAndReturnOptional(request: ObjectWithRequiredField(
    ///         string: "string"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnOptional(request: ObjectWithRequiredField? = nil, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField? {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/opt-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredField?.self
        )
    }
}