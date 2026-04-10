import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(request: Requests.ServicePostRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func justfile(request: Requests.ServiceJustFileRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func justfilewithqueryparams(maybeString: Nullable<String>? = nil, integer: Int, maybeInteger: Nullable<Int>? = nil, listOfStrings: String? = nil, optionalListOfStrings: Nullable<String>? = nil, request: Requests.ServiceJustFileWithQueryParamsRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file-with-query-params",
            contentType: .multipartFormData,
            queryParams: [
                "maybeString": maybeString?.wrappedValue.map { .string($0) }, 
                "integer": .int(integer), 
                "maybeInteger": maybeInteger?.wrappedValue.map { .int($0) }, 
                "listOfStrings": listOfStrings.map { .string($0) }, 
                "optionalListOfStrings": optionalListOfStrings?.wrappedValue.map { .string($0) }
            ],
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func justfilewithoptionalqueryparams(maybeString: Nullable<String>? = nil, maybeInteger: Nullable<Int>? = nil, request: Requests.ServiceJustFileWithOptionalQueryParamsRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file-with-optional-query-params",
            contentType: .multipartFormData,
            queryParams: [
                "maybeString": maybeString?.wrappedValue.map { .string($0) }, 
                "maybeInteger": maybeInteger?.wrappedValue.map { .int($0) }
            ],
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withcontenttype(request: Requests.ServiceWithContentTypeRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-content-type",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withformencoding(request: Requests.ServiceWithFormEncodingRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-form-encoding",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func withformencodedcontainers(request: Requests.ServiceWithFormEncodedContainersRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/form-encoded",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }

    public func optionalargs(request: Requests.ServiceOptionalArgsRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/optional-args",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withinlinetype(request: Requests.ServiceWithInlineTypeRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-type",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withjsonproperty(request: Requests.ServiceWithJsonPropertyRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-json-property",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func simple(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/snippet",
            requestOptions: requestOptions
        )
    }

    public func withliteralandenumtypes(request: Requests.ServiceWithLiteralAndEnumTypesRequest, requestOptions: RequestOptions? = nil) async throws -> String {
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