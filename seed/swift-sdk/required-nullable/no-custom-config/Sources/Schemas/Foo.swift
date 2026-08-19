import Foundation

public struct Foo: Codable, Hashable, Sendable {
    public let bar: String?
    public let nullableBar: Nullable<String>?
    public let nullableRequiredBar: Nullable<String>
    public let requiredBar: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        bar: String? = nil,
        nullableBar: Nullable<String>? = nil,
        nullableRequiredBar: Nullable<String>,
        requiredBar: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.bar = bar
        self.nullableBar = nullableBar
        self.nullableRequiredBar = nullableRequiredBar
        self.requiredBar = requiredBar
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.bar = try container.decodeIfPresent(String.self, forKey: .bar)
        self.nullableBar = try container.decodeNullableIfPresent(String.self, forKey: .nullableBar)
        self.nullableRequiredBar = try container.decode(Nullable<String>.self, forKey: .nullableRequiredBar)
        self.requiredBar = try container.decode(String.self, forKey: .requiredBar)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.bar, forKey: .bar)
        try container.encodeNullableIfPresent(self.nullableBar, forKey: .nullableBar)
        try container.encode(self.nullableRequiredBar, forKey: .nullableRequiredBar)
        try container.encode(self.requiredBar, forKey: .requiredBar)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case bar
        case nullableBar = "nullable_bar"
        case nullableRequiredBar = "nullable_required_bar"
        case requiredBar = "required_bar"
    }
}