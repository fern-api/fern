import Foundation

public enum ApiEnvironment: String, CaseIterable {
    case regionalApiServer = "https://api.us-east-1.prod.example.com/v1"
}

extension ApiEnvironment {
    /// Returns this environment's URL with the given server URL variables substituted in. Variables that are not provided fall back to their defaults.
    public func url(region: String? = nil, environment: String? = nil) -> String {
        switch self {
        case .regionalApiServer:
            return "https://api.\(region ?? "us-east-1").\(environment ?? "prod").example.com/v1"
        }
    }
}