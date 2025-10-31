import Foundation

/// Test enum for nullable enum fields
public enum UserRole: String, Codable, Hashable, CaseIterable, Sendable {
    case admin = "ADMIN"
    case user = "USER"
    case guest = "GUEST"
    case moderator = "MODERATOR"
}