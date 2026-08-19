import Foundation

public struct TranscriptEvent: Codable, Hashable, Sendable {
    public let type: Transcript
    public let data: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Transcript,
        data: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(Transcript.self, forKey: .type)
        self.data = try container.decode(String.self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.data, forKey: .data)
    }

    public enum Transcript: String, Codable, Hashable, CaseIterable, Sendable {
        case transcript
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case data
    }
}