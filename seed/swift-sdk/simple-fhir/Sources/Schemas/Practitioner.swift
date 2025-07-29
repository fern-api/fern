public struct Practitioner: Codable, Hashable, Sendable {
    public let resourceType: Any
    public let name: String
    public let additionalProperties: [String: JSONValue]

    public init(
        resourceType: Any,
        name: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.resourceType = resourceType
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.resourceType = try container.decode(Any.self, forKey: .resourceType)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.resourceType, forKey: .resourceType)
        try container.encode(self.name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
        case name
    }
}