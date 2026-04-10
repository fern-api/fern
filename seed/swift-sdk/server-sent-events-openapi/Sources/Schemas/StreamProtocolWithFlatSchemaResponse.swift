import Foundation

public enum StreamProtocolWithFlatSchemaResponse: Codable, Hashable, Sendable {
    case entity(DataContextEntityEvent)
    case heartbeat(DataContextHeartbeat)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .event)
        switch discriminant {
        case "entity":
            self = .entity(try DataContextEntityEvent(from: decoder))
        case "heartbeat":
            self = .heartbeat(try DataContextHeartbeat(from: decoder))
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
        case .entity(let data):
            try container.encode("entity", forKey: .event)
            try data.encode(to: encoder)
        case .heartbeat(let data):
            try container.encode("heartbeat", forKey: .event)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case event
    }
}