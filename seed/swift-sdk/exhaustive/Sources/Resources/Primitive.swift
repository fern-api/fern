public final class PrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnString(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func getAndReturnInt(requestOptions: RequestOptions? = nil) async throws -> Int {
    }

    public func getAndReturnLong(requestOptions: RequestOptions? = nil) async throws -> Int64 {
    }

    public func getAndReturnDouble(requestOptions: RequestOptions? = nil) async throws -> Double {
    }

    public func getAndReturnBool(requestOptions: RequestOptions? = nil) async throws -> Bool {
    }

    public func getAndReturnDatetime(requestOptions: RequestOptions? = nil) async throws -> Date {
    }

    public func getAndReturnDate(requestOptions: RequestOptions? = nil) async throws -> Date {
    }

    public func getAndReturnUuid(requestOptions: RequestOptions? = nil) async throws -> UUID {
    }

    public func getAndReturnBase64(requestOptions: RequestOptions? = nil) async throws -> String {
    }
}