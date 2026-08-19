import Foundation

public struct TypeWithSingleCharPropertyEqualToTypeStartingLetter: Codable, Hashable, Sendable {
    public let t: String
    public let ty: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        t: String,
        ty: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.t = t
        self.ty = ty
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.t = try container.decode(String.self, forKey: .t)
        self.ty = try container.decode(String.self, forKey: .ty)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.t, forKey: .t)
        try container.encode(self.ty, forKey: .ty)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case t
        case ty
    }
}