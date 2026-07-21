import Foundation

public enum RefreshTokenAuthRequestGrantType: String, Codable, Hashable, CaseIterable, Sendable {
    case refreshToken = "refresh_token"
}