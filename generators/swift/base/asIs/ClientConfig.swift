public final class ClientConfig: Sendable {
    struct Defaults {
        static let timeout: Int = 60
        static let maxRetries: Int = 2
    }

    let baseURL: String
    let apiKey: String?
    let token: String?
    let headers: [String: String]?
    let urlSession: URLSession

    init(
        baseURL: String,
        apiKey: String? = nil,
        token: String? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.baseURL = baseURL
        self.apiKey = apiKey
        self.token = token
        self.headers = headers
        self.urlSession = urlSession ?? buildURLSession(timeoutSeconds: timeout)
    }
}

private func buildURLSession(timeoutSeconds: Int?) -> URLSession {
    let configuration = URLSessionConfiguration.default
    configuration.timeoutIntervalForRequest = .init(timeoutSeconds ?? ClientConfig.Defaults.timeout)
    return .init(configuration: configuration)
}
