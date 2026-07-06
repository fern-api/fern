import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(request: Requests.MyRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import FileUpload
    /// 
    /// private func main() async throws {
    ///     let client = FileUploadClient()
    /// 
    ///     _ = try await client.service.justFile(request: .init(file: .init(data: Data("".utf8))))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func justFile(request: Requests.JustFileRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func justFileWithQueryParams(maybeString: String? = nil, integer: Int, maybeInteger: Int? = nil, listOfStrings: [String], optionalListOfStrings: [String]? = nil, request: Requests.JustFileWithQueryParamsRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file-with-query-params",
            contentType: .multipartFormData,
            queryParams: [
                "maybeString": maybeString.map { .string($0) }, 
                "integer": .int(integer), 
                "maybeInteger": maybeInteger.map { .int($0) }, 
                "listOfStrings": .stringArray(listOfStrings), 
                "optionalListOfStrings": optionalListOfStrings.map { .stringArray($0) }
            ],
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func justFileWithOptionalQueryParams(maybeString: String? = nil, maybeInteger: Int? = nil, request: Requests.JustFileWithOptionalQueryParamsRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file-with-optional-query-params",
            contentType: .multipartFormData,
            queryParams: [
                "maybeString": maybeString.map { .string($0) }, 
                "maybeInteger": maybeInteger.map { .int($0) }
            ],
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withContentType(request: Requests.WithContentTypeRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-content-type",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withFormEncoding(request: Requests.WithFormEncodingRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-form-encoding",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withFormEncodedContainers(request: Requests.MyOtherRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import FileUpload
    /// 
    /// private func main() async throws {
    ///     let client = FileUploadClient()
    /// 
    ///     _ = try await client.service.optionalArgs(request: .init(imageFile: .init(data: Data("".utf8))))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func optionalArgs(request: Requests.OptionalArgsRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/optional-args",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withInlineType(request: Requests.InlineTypeRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-type",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withJsonProperty(request: Requests.WithJsonPropertyRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-json-property",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import FileUpload
    /// 
    /// private func main() async throws {
    ///     let client = FileUploadClient()
    /// 
    ///     _ = try await client.service.withRefBody(request: .init(
    ///         imageFile: .init(data: Data("".utf8)),
    ///         request: MyObject(
    ///             foo: "bar"
    ///         )
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func withRefBody(request: Requests.WithRefBodyRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-ref-body",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import FileUpload
    /// 
    /// private func main() async throws {
    ///     let client = FileUploadClient()
    /// 
    ///     _ = try await client.service.simple()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func simple(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/snippet",
            requestOptions: requestOptions
        )
    }

    public func withLiteralAndEnumTypes(request: Requests.LiteralEnumRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-literal-enum",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}