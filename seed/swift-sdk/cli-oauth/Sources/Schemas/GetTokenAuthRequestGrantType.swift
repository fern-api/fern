import Foundation

public enum GetTokenAuthRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case clientCredentials = "client_credentials"
}