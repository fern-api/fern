import Foundation

public struct ANestedLiteral: Codable, Hashable, Sendable {
    public let myLiteral: JSONValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        myLiteral: JSONValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.myLiteral = myLiteral
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.myLiteral = try container.decode(JSONValue.self, forKey: .myLiteral)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.myLiteral, forKey: .myLiteral)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case myLiteral
    }
}