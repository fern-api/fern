public final class PrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnString(requestOptions: RequestOptions? = nil) throws -> String {
    }

    public func getAndReturnInt(requestOptions: RequestOptions? = nil) throws -> Int {
    }

    public func getAndReturnLong(requestOptions: RequestOptions? = nil) throws -> Int64 {
    }

    public func getAndReturnDouble(requestOptions: RequestOptions? = nil) throws -> Double {
    }

    public func getAndReturnBool(requestOptions: RequestOptions? = nil) throws -> Bool {
    }

    public func getAndReturnDatetime(requestOptions: RequestOptions? = nil) throws -> Date {
    }

    public func getAndReturnDate(requestOptions: RequestOptions? = nil) throws -> Date {
    }

    public func getAndReturnUuid(requestOptions: RequestOptions? = nil) throws -> UUID {
    }

    public func getAndReturnBase64(requestOptions: RequestOptions? = nil) throws -> String {
    }
}