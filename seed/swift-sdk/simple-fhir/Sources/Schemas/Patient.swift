public struct Patient: Codable, Hashable, Sendable {
    public let resourceType: JSONValue
    public let name: String
    public let scripts: [Script]
    public let additionalProperties: [String: JSONValue]

    public init(
        resourceType: JSONValue,
        name: String,
        scripts: [Script],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.resourceType = resourceType
        self.name = name
        self.scripts = scripts
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.resourceType = try container.decode(JSONValue.self, forKey: .resourceType)
        self.name = try container.decode(String.self, forKey: .name)
        self.scripts = try container.decode([Script].self, forKey: .scripts)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.resourceType, forKey: .resourceType)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.scripts, forKey: .scripts)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
        case name
        case scripts
    }
}