import Foundation

public enum StreamEvent: Codable, Hashable, Sendable {
    case completion(CompletionEvent)
    case error(ErrorEvent)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .event)
        switch discriminant {
        case "completion":
            self = .completion(try CompletionEvent(from: decoder))
        case "error":
            self = .error(try ErrorEvent(from: decoder))
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
        case .completion(let data):
            try container.encode("completion", forKey: .event)
            try data.encode(to: encoder)
        case .error(let data):
            try container.encode("error", forKey: .event)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case event
    }
}