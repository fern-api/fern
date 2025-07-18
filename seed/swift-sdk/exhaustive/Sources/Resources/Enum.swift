public final class EnumClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnEnum(requestOptions: RequestOptions? = nil) async throws -> WeatherReport {
        fatalError("Not implemented.")
    }
}