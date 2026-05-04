import Foundation

public enum StreamEventDiscriminantInData: Codable, Hashable, Sendable {
    case groupCreated(GroupCreatedEvent)
    case groupDeleted(GroupDeletedEvent)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "group.created":
            self = .groupCreated(try GroupCreatedEvent(from: decoder))
        case "group.deleted":
            self = .groupDeleted(try GroupDeletedEvent(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .groupCreated(let data):
            try container.encode("group.created", forKey: .type)
            try data.encode(to: encoder)
        case .groupDeleted(let data):
            try container.encode("group.deleted", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}