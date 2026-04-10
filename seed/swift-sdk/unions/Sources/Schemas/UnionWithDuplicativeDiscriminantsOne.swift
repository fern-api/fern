import Foundation

public struct UnionWithDuplicativeDiscriminantsOne: Codable, Hashable, Sendable {
    public let type: Nullable<UnionWithDuplicativeDiscriminantsOneType>
    public let title: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Nullable<UnionWithDuplicativeDiscriminantsOneType>,
        title: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.title = title
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(Nullable<UnionWithDuplicativeDiscriminantsOneType>.self, forKey: .type)
        self.title = try container.decode(String.self, forKey: .title)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.title, forKey: .title)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case title
    }
}