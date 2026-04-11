import Foundation

public enum StreamProtocolNoCollisionResponse: Codable, Hashable, Sendable {
    case heartbeat(ProtocolHeartbeat)
    case numberData(ProtocolNumberEvent)
    case objectData(ProtocolObjectEvent)
    case stringData(ProtocolStringEvent)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .event)
        switch discriminant {
        case "heartbeat":
            self = .heartbeat(try ProtocolHeartbeat(from: decoder))
        case "number_data":
            self = .numberData(try ProtocolNumberEvent(from: decoder))
        case "object_data":
            self = .objectData(try ProtocolObjectEvent(from: decoder))
        case "string_data":
            self = .stringData(try ProtocolStringEvent(from: decoder))
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
        case .heartbeat(let data):
            try container.encode("heartbeat", forKey: .event)
            try data.encode(to: encoder)
        case .numberData(let data):
            try container.encode("number_data", forKey: .event)
            try data.encode(to: encoder)
        case .objectData(let data):
            try container.encode("object_data", forKey: .event)
            try data.encode(to: encoder)
        case .stringData(let data):
            try container.encode("string_data", forKey: .event)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case event
    }
}