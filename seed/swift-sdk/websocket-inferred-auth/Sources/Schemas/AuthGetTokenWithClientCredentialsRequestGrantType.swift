import Foundation

public enum AuthGetTokenWithClientCredentialsRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case clientCredentials = "client_credentials"
}