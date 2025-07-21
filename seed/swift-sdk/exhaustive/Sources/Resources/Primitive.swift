public final class PrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnString(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/string", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnInt(requestOptions: RequestOptions? = nil) async throws -> Int {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/integer", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnLong(requestOptions: RequestOptions? = nil) async throws -> Int64 {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/long", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDouble(requestOptions: RequestOptions? = nil) async throws -> Double {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/double", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnBool(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/boolean", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDatetime(requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/datetime", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDate(requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/date", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnUuid(requestOptions: RequestOptions? = nil) async throws -> UUID {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/uuid", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnBase64(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/base64", 
            requestOptions: requestOptions
        )
    }
}