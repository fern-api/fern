import Foundation

public struct Cat: Codable, Hashable, Sendable {
    public let name: String
    public let likesToMeow: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        likesToMeow: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.likesToMeow = likesToMeow
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.likesToMeow = try container.decode(Bool.self, forKey: .likesToMeow)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.likesToMeow, forKey: .likesToMeow)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case likesToMeow
    }
}