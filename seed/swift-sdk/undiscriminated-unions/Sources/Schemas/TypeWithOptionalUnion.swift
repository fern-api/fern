import Foundation

public struct TypeWithOptionalUnion: Codable, Hashable, Sendable {
    public let myUnion: MyUnion?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        myUnion: MyUnion? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.myUnion = myUnion
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.myUnion = try container.decodeIfPresent(MyUnion.self, forKey: .myUnion)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.myUnion, forKey: .myUnion)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case myUnion
    }
}