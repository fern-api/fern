import Foundation

public enum EventTypeEnum: String, Codable, Hashable, CaseIterable, Sendable {
    case groupCreated = "group.created"
    case userUpdated = "user.updated"
}