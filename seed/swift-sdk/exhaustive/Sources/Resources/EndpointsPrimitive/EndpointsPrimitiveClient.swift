import Foundation

public final class EndpointsPrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsPrimitiveGetAndReturnString(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/string",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsPrimitiveGetAndReturnInt(request: Int, requestOptions: RequestOptions? = nil) async throws -> Int {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/integer",
            body: request,
            requestOptions: requestOptions,
            responseType: Int.self
        )
    }

    public func endpointsPrimitiveGetAndReturnLong(request: Int64, requestOptions: RequestOptions? = nil) async throws -> Int64 {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/long",
            body: request,
            requestOptions: requestOptions,
            responseType: Int64.self
        )
    }

    public func endpointsPrimitiveGetAndReturnDouble(request: Double, requestOptions: RequestOptions? = nil) async throws -> Double {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/double",
            body: request,
            requestOptions: requestOptions,
            responseType: Double.self
        )
    }

    public func endpointsPrimitiveGetAndReturnBool(request: Bool, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/boolean",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    public func endpointsPrimitiveGetAndReturnDatetime(request: Date, requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/datetime",
            body: request,
            requestOptions: requestOptions,
            responseType: Date.self
        )
    }

    public func endpointsPrimitiveGetAndReturnDate(request: CalendarDate, requestOptions: RequestOptions? = nil) async throws -> CalendarDate {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/date",
            body: request,
            requestOptions: requestOptions,
            responseType: CalendarDate.self
        )
    }

    public func endpointsPrimitiveGetAndReturnUuid(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/uuid",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsPrimitiveGetAndReturnBase64(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/base64",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}