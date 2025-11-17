import Foundation

public final class ClientConfig: Swift.Sendable {
    public typealias CredentialProvider = @Sendable () async throws -> Swift.String

    struct Defaults {
        static let timeout: Swift.Int = 60
        static let maxRetries: Swift.Int = 2
    }

    struct HeaderAuth {
        let key: Swift.String
        let header: Swift.String
    }

    struct BearerAuth {
        let token: Token

        enum Token: Swift.Sendable {
            case staticToken(Swift.String)
            case provider(CredentialProvider)

            func retrieve() async throws -> Swift.String {
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
        let username: Swift.String?
        let password: Swift.String?

        var token: Swift.String? {
            if let username, let password {
                let credentials: Swift.String = "\(username):\(password)"
                let data = credentials.data(using: .utf8) ?? Foundation.Data()
                return data.base64EncodedString()
            }
            return nil
        }
    }

    let baseURL: Swift.String
    let headerAuth: HeaderAuth?
    let bearerAuth: BearerAuth?
    let basicAuth: BasicAuth?
    let headers: [Swift.String: Swift.String]?
    let timeout: Swift.Int
    let maxRetries: Swift.Int
    let urlSession: Networking.URLSession

    init(
        baseURL: Swift.String,
        headerAuth: HeaderAuth? = nil,
        bearerAuth: BearerAuth? = nil,
        basicAuth: BasicAuth? = nil,
        headers: [Swift.String: Swift.String]? = nil,
        timeout: Swift.Int? = nil,
        maxRetries: Swift.Int? = nil,
        urlSession: Networking.URLSession? = nil
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

private func buildURLSession(timeoutSeconds: Swift.Int) -> Networking.URLSession {
    let configuration = Networking.URLSessionConfiguration.default
    configuration.timeoutIntervalForRequest = .init(timeoutSeconds)
    return .init(configuration: configuration)
}
