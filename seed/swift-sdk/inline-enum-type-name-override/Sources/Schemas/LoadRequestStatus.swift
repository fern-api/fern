import Foundation

public enum LoadRequestStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case active
    case inactive
    case pending
}