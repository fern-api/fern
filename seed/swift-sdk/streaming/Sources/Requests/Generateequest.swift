import Foundation

public struct Generateequest: Codable, Hashable, Sendable {
    public let stream: JSONValue
    public let numEvents: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        stream: JSONValue,
        numEvents: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.stream = stream
        self.numEvents = numEvents
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.stream = try container.decode(JSONValue.self, forKey: .stream)
        self.numEvents = try container.decode(Int.self, forKey: .numEvents)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.stream, forKey: .stream)
        try container.encode(self.numEvents, forKey: .numEvents)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case stream
        case numEvents = "num_events"
    }
}