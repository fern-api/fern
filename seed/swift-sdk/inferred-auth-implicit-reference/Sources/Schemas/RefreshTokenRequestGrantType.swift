import Foundation

public enum RefreshTokenRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case refreshToken = "refresh_token"
}