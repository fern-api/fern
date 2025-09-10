import Foundation

public struct ANestedLiteral: Codable, Hashable, Sendable {
    public let myLiteral: HowSuperCool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        myLiteral: HowSuperCool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.myLiteral = myLiteral
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.myLiteral = try container.decode(HowSuperCool.self, forKey: .myLiteral)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.myLiteral, forKey: .myLiteral)
    }

    public enum HowSuperCool: String, Codable, Hashable, CaseIterable, Sendable {
        case howSuperCool = "How super cool"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case myLiteral
    }
}