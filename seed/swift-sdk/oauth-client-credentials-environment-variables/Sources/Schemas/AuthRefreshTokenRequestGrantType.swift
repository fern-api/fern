import Foundation

public enum AuthRefreshTokenRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case refreshToken = "refresh_token"
}