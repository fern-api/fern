import Foundation

public enum AuthGetTokenRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case clientCredentials = "client_credentials"
}