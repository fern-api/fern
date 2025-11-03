import Foundation

/// Test enum with values for optional enum fields
public enum UserStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case active
    case inactive
    case suspended
    case deleted
}