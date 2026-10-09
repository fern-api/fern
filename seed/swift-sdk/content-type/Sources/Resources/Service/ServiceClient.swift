import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ContentTypes
    ///
    /// private func main() async throws {
    ///     let client = ContentTypesClient()
    ///
    ///     _ = try await client.service.patch(request: .init(
    ///         application: .value("application"),
    ///         requireAuth: .value(true)
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func patch(request: Requests.PatchProxyRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Update with JSON merge patch - complex types.
    /// This endpoint demonstrates the distinction between:
    /// - optional<T> fields (can be present or absent, but not null)
    /// - optional<nullable<T>> fields (can be present, absent, or null)
    ///
    /// ```swift
    /// import Foundation
    /// import ContentTypes
    ///
    /// private func main() async throws {
    ///     let client = ContentTypesClient()
    ///
    ///     _ = try await client.service.patchComplex(
    ///         id: "id",
    ///         request: .init(
    ///             name: "name",
    ///             age: 1,
    ///             active: true,
    ///             metadata: [
    ///                 "metadata": .object([
    ///                     "key": .string("value")
    ///                 ])
    ///             ],
    ///             tags: [
    ///                 "tags",
    ///                 "tags"
    ///             ],
    ///             email: .value("email"),
    ///             nickname: .value("nickname"),
    ///             bio: .value("bio"),
    ///             profileImageUrl: .value("profileImageUrl"),
    ///             settings: .value([
    ///                 "settings": .object([
    ///                     "key": .string("value")
    ///                 ])
    ///             ])
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func patchComplex(id: String, request: Requests.PatchComplexRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/complex/\(id)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Named request with mixed optional/nullable fields and merge-patch content type.
    /// This should trigger the NPE issue when optional fields aren't initialized.
    ///
    /// ```swift
    /// import Foundation
    /// import ContentTypes
    ///
    /// private func main() async throws {
    ///     let client = ContentTypesClient()
    ///
    ///     _ = try await client.service.namedPatchWithMixed(
    ///         id: "id",
    ///         request: .init(
    ///             appId: "appId",
    ///             instructions: .value("instructions"),
    ///             active: .value(true)
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func namedPatchWithMixed(id: String, request: Requests.NamedMixedPatchRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/named-mixed/\(id)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
    /// This endpoint should:
    /// 1. Not NPE when fields are not provided (tests initialization)
    /// 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
    ///
    /// ```swift
    /// import Foundation
    /// import ContentTypes
    ///
    /// private func main() async throws {
    ///     let client = ContentTypesClient()
    ///
    ///     _ = try await client.service.optionalMergePatchTest(request: .init(
    ///         requiredField: "requiredField",
    ///         optionalString: "optionalString",
    ///         optionalInteger: 1,
    ///         optionalBoolean: true,
    ///         nullableString: .value("nullableString")
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func optionalMergePatchTest(request: Requests.OptionalMergePatchRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/optional-merge-patch-test",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Regular PATCH endpoint without merge-patch semantics
    ///
    /// ```swift
    /// import Foundation
    /// import ContentTypes
    ///
    /// private func main() async throws {
    ///     let client = ContentTypesClient()
    ///
    ///     _ = try await client.service.regularPatch(
    ///         id: "id",
    ///         request: .init(
    ///             field1: "field1",
    ///             field2: 1
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func regularPatch(id: String, request: Requests.RegularPatchRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/regular/\(id)",
            body: request,
            requestOptions: requestOptions
        )
    }
}