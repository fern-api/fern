import Foundation

/// The type of grant being requested
public enum GrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case authorizationCode = "authorization_code"
    case refreshToken = "refresh_token"
    case clientCredentials = "client_credentials"
}