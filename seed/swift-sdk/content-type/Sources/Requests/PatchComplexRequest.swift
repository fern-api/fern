import Foundation

public struct PatchComplexRequest: Codable, Hashable, Sendable {
    public let name: String?
    public let email: JSONValue?
    public let age: Int?
    public let active: Bool?
    public let metadata: [String: JSONValue]?
    public let tags: [String]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String? = nil,
        email: JSONValue? = nil,
        age: Int? = nil,
        active: Bool? = nil,
        metadata: [String: JSONValue]? = nil,
        tags: [String]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.email = email
        self.age = age
        self.active = active
        self.metadata = metadata
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decodeIfPresent(String.self, forKey: .name)
        self.email = try container.decodeIfPresent(JSONValue.self, forKey: .email)
        self.age = try container.decodeIfPresent(Int.self, forKey: .age)
        self.active = try container.decodeIfPresent(Bool.self, forKey: .active)
        self.metadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .metadata)
        self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.name, forKey: .name)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.age, forKey: .age)
        try container.encodeIfPresent(self.active, forKey: .active)
        try container.encodeIfPresent(self.metadata, forKey: .metadata)
        try container.encodeIfPresent(self.tags, forKey: .tags)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case email
        case age
        case active
        case metadata
        case tags
    }
}