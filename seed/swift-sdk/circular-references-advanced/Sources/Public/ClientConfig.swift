public final class ClientConfig: Sendable {
    struct Defaults {
        static let timeout: Int = 60
        static let maxRetries: Int = 2
    }

    struct ApiKeyConfig {
        let key: String
        let header: String
    }

    let baseURL: String
    let apiKey: ApiKeyConfig?
    let token: String?
    let headers: [String: String]?
    let timeout: Int
    let maxRetries: Int
    let urlSession: URLSession

    init(
        baseURL: String,
        apiKey: ApiKeyConfig? = nil,
        token: String? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.baseURL = baseURL
        self.apiKey = apiKey
        self.token = token
        self.headers = headers
        self.timeout = timeout ?? Defaults.timeout
        self.maxRetries = maxRetries ?? Defaults.maxRetries
        self.urlSession = urlSession ?? buildURLSession(timeoutSeconds: self.timeout)
    }
}

private func buildURLSession(timeoutSeconds: Int) -> URLSession {
    let configuration = URLSessionConfiguration.default
    configuration.timeoutIntervalForRequest = .init(timeoutSeconds)
    return .init(configuration: configuration)
}
