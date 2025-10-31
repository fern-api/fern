import Foundation

public final class ClientConfig: Sendable {
    public typealias CredentialProvider = @Sendable () async throws -> String

    struct Defaults {
        static let timeout: Int = 60
        static let maxRetries: Int = 2
    }

    struct HeaderAuth {
        let key: String
        let header: String
    }

    struct BearerAuth {
        let token: Token

        enum Token: Sendable {
            case staticToken(String)
            case provider(CredentialProvider)

            func retrieve() async throws -> String {
                switch self {
                case .staticToken(let token):
                    return token
                case .provider(let provider):
                    return try await provider()
                }
            }
        }
    }

    struct BasicAuth {
        let username: String?
        let password: String?

        var token: String? {
            if let username, let password {
                let credentials: String = "\(username):\(password)"
                let data = credentials.data(using: .utf8) ?? Data()
                return data.base64EncodedString()
            }
            return nil
        }
    }

    let baseURL: String
    let headerAuth: HeaderAuth?
    let bearerAuth: BearerAuth?
    let basicAuth: BasicAuth?
    let headers: [String: String]?
    let timeout: Int
    let maxRetries: Int
    let urlSession: URLSession

    init(
        baseURL: String,
        headerAuth: HeaderAuth? = nil,
        bearerAuth: BearerAuth? = nil,
        basicAuth: BasicAuth? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.baseURL = baseURL
        self.headerAuth = headerAuth
        self.bearerAuth = bearerAuth
        self.basicAuth = basicAuth
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
