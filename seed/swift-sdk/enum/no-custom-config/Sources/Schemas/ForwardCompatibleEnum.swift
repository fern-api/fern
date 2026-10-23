import Foundation

/// Tests forward-compatible enums that accept
/// both known values and arbitrary strings.
public enum ForwardCompatibleEnum: String, Codable, Hashable, CaseIterable, Sendable {
    case active
    case inactive
}