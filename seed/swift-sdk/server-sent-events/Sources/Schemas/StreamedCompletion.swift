import Foundation

public struct StreamedCompletion: Codable, Hashable, Sendable {
    public let delta: String
    public let tokens: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        delta: String,
        tokens: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.delta = delta
        self.tokens = tokens
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.delta = try container.decode(String.self, forKey: .delta)
        self.tokens = try container.decodeIfPresent(Int.self, forKey: .tokens)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.delta, forKey: .delta)
        try container.encodeIfPresent(self.tokens, forKey: .tokens)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case delta
        case tokens
    }
}