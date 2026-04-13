import Foundation

public enum GetTokenRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case clientCredentials = "client_credentials"
}