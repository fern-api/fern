import Foundation

public final class ObjectClient: Sendable {
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
    ///     _ = try await client.endpoints.object.getAndReturnWithOptionalField(request: ObjectWithOptionalField(
    ///         string: "string",
    ///         integer: 1,
    ///         long: 1000000,
    ///         double: 1.1,
    ///         bool: true,
    ///         datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///         date: CalendarDate("2023-01-15")!,
    ///         uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///         base64: "SGVsbG8gd29ybGQh",
    ///         list: [
    ///             "list",
    ///             "list"
    ///         ],
    ///         set: .array([
    ///             .string("set")
    ///         ]),
    ///         map: [
    ///             1: "map"
    ///         ],
    ///         bigint: "1000000"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithOptionalField(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithRequiredField(request: ObjectWithRequiredField(
    ///         string: "string"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithRequiredField(request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithMapOfMap(request: ObjectWithMapOfMap(
    ///         map: [
    ///             "map": [
    ///                 "map": "map"
    ///             ]
    ///         ]
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithMapOfMap(request: ObjectWithMapOfMap, requestOptions: RequestOptions? = nil) async throws -> ObjectWithMapOfMap {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-map-of-map",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithMapOfMap.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField(
    ///         string: "string",
    ///         nestedObject: ObjectWithOptionalField(
    ///             string: "string",
    ///             integer: 1,
    ///             long: 1000000,
    ///             double: 1.1,
    ///             bool: true,
    ///             datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             date: CalendarDate("2023-01-15")!,
    ///             uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///             base64: "SGVsbG8gd29ybGQh",
    ///             list: [
    ///                 "list",
    ///                 "list"
    ///             ],
    ///             set: .array([
    ///                 .string("set")
    ///             ]),
    ///             map: [
    ///                 1: "map"
    ///             ],
    ///             bigint: "1000000"
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithOptionalField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
    ///         string: "string",
    ///         request: NestedObjectWithRequiredField(
    ///             string: "string",
    ///             nestedObject: ObjectWithOptionalField(
    ///                 string: "string",
    ///                 integer: 1,
    ///                 long: 1000000,
    ///                 double: 1.1,
    ///                 bool: true,
    ///                 datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 date: CalendarDate("2023-01-15")!,
    ///                 uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 base64: "SGVsbG8gd29ybGQh",
    ///                 list: [
    ///                     "list",
    ///                     "list"
    ///                 ],
    ///                 set: .array([
    ///                     .string("set")
    ///                 ]),
    ///                 map: [
    ///                     1: "map"
    ///                 ],
    ///                 bigint: "1000000"
    ///             )
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnNestedWithRequiredField(string: String, request: NestedObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field/\(string)",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithRequiredField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(request: [
    ///         NestedObjectWithRequiredField(
    ///             string: "string",
    ///             nestedObject: ObjectWithOptionalField(
    ///                 string: "string",
    ///                 integer: 1,
    ///                 long: 1000000,
    ///                 double: 1.1,
    ///                 bool: true,
    ///                 datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 date: CalendarDate("2023-01-15")!,
    ///                 uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 base64: "SGVsbG8gd29ybGQh",
    ///                 list: [
    ///                     "list",
    ///                     "list"
    ///                 ],
    ///                 set: .array([
    ///                     .string("set")
    ///                 ]),
    ///                 map: [
    ///                     1: "map"
    ///                 ],
    ///                 bigint: "1000000"
    ///             )
    ///         ),
    ///         NestedObjectWithRequiredField(
    ///             string: "string",
    ///             nestedObject: ObjectWithOptionalField(
    ///                 string: "string",
    ///                 integer: 1,
    ///                 long: 1000000,
    ///                 double: 1.1,
    ///                 bool: true,
    ///                 datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 date: CalendarDate("2023-01-15")!,
    ///                 uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 base64: "SGVsbG8gd29ybGQh",
    ///                 list: [
    ///                     "list",
    ///                     "list"
    ///                 ],
    ///                 set: .array([
    ///                     .string("set")
    ///                 ]),
    ///                 map: [
    ///                     1: "map"
    ///                 ],
    ///                 bigint: "1000000"
    ///             )
    ///         )
    ///     ])
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnNestedWithRequiredFieldAsList(request: [NestedObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field-list",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithRequiredField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithUnknownField(request: ObjectWithUnknownField(
    ///         unknown: .object([
    ///             "$ref": .string("https://example.com/schema")
    ///         ])
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithUnknownField(request: ObjectWithUnknownField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithUnknownField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-unknown-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithUnknownField.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithDocumentedUnknownType(request: ObjectWithDocumentedUnknownType(
    ///         documentedUnknownType: .object([
    ///             "key": .string("value")
    ///         ])
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithDocumentedUnknownType(request: ObjectWithDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> ObjectWithDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithDocumentedUnknownType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType(request: [
    ///         "string": .object([
    ///             "key": .string("value")
    ///         ])
    ///     ])
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnMapOfDocumentedUnknownType(request: MapOfDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> MapOfDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-map-of-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: MapOfDocumentedUnknownType.self
        )
    }

    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields(
    ///         requiredString: "hello",
    ///         requiredInteger: 0,
    ///         optionalString: "world",
    ///         requiredLong: 0
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields, requestOptions: RequestOptions? = nil) async throws -> ObjectWithMixedRequiredAndOptionalFields {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-mixed-required-and-optional-fields",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithMixedRequiredAndOptionalFields.self
        )
    }

    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithRequiredNestedObject(request: ObjectWithRequiredNestedObject(
    ///         requiredString: "hello",
    ///         requiredObject: NestedObjectWithRequiredField(
    ///             string: "nested",
    ///             nestedObject: ObjectWithOptionalField(
    ///
    ///             )
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithRequiredNestedObject(request: ObjectWithRequiredNestedObject, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredNestedObject {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-nested-object",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredNestedObject.self
        )
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(request: ObjectWithDatetimeLikeString(
    ///         datetimeLikeString: "2023-08-31T14:15:22Z",
    ///         actualDatetime: try! Date("2023-08-31T14:15:22Z", strategy: .iso8601)
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithDatetimeLikeString(request: ObjectWithDatetimeLikeString, requestOptions: RequestOptions? = nil) async throws -> ObjectWithDatetimeLikeString {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-datetime-like-string",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithDatetimeLikeString.self
        )
    }
}