import Foundation

public enum EntityEventPayloadEventType: String, Codable, Hashable, CaseIterable, Sendable {
    case created = "CREATED"
    case updated = "UPDATED"
    case deleted = "DELETED"
    case preexisting = "PREEXISTING"
}