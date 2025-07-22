public final class PrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnString(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/string", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnInt(request: Int, requestOptions: RequestOptions? = nil) async throws -> Int {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/integer", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnLong(request: Int64, requestOptions: RequestOptions? = nil) async throws -> Int64 {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/long", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDouble(request: Double, requestOptions: RequestOptions? = nil) async throws -> Double {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/double", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnBool(request: Bool, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/boolean", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDatetime(request: Date, requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/datetime", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnDate(request: Date, requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/date", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnUuid(request: UUID, requestOptions: RequestOptions? = nil) async throws -> UUID {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/uuid", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnBase64(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/primitive/base64", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}