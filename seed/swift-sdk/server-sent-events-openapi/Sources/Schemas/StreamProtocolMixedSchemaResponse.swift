import Foundation

public enum StreamProtocolMixedSchemaResponse: Codable, Hashable, Sendable {
    case entity(DataContextEntityEvent)
    case heartbeat(DataContextHeartbeat)
    case objectData(ProtocolObjectEvent)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .event)
        switch discriminant {
        case "entity":
            self = .entity(try DataContextEntityEvent(from: decoder))
        case "heartbeat":
            self = .heartbeat(try DataContextHeartbeat(from: decoder))
        case "object_data":
            self = .objectData(try ProtocolObjectEvent(from: decoder))
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
        case .objectData(let data):
            try container.encode("object_data", forKey: .event)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case event
    }
}