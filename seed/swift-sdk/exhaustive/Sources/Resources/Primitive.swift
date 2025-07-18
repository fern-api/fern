public final class PrimitiveClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnString(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }

    public func getAndReturnInt(requestOptions: RequestOptions? = nil) async throws -> Int {
        fatalError("Not implemented.")
    }

    public func getAndReturnLong(requestOptions: RequestOptions? = nil) async throws -> Int64 {
        fatalError("Not implemented.")
    }

    public func getAndReturnDouble(requestOptions: RequestOptions? = nil) async throws -> Double {
        fatalError("Not implemented.")
    }

    public func getAndReturnBool(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }

    public func getAndReturnDatetime(requestOptions: RequestOptions? = nil) async throws -> Date {
        fatalError("Not implemented.")
    }

    public func getAndReturnDate(requestOptions: RequestOptions? = nil) async throws -> Date {
        fatalError("Not implemented.")
    }

    public func getAndReturnUuid(requestOptions: RequestOptions? = nil) async throws -> UUID {
        fatalError("Not implemented.")
    }

    public func getAndReturnBase64(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }
}