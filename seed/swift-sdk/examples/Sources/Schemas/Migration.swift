public struct Migration: Codable, Hashable, Sendable {
    public let name: String
    public let status: MigrationStatus
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        status: MigrationStatus,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.status = try container.decode(MigrationStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case status
    }
}