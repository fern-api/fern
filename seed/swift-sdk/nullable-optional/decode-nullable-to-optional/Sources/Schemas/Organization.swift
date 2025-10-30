import Foundation

public struct Organization: Codable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let domain: String?
    public let employeeCount: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        domain: String? = nil,
        employeeCount: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.domain = domain
        self.employeeCount = employeeCount
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.domain = try container.decodeIfPresent(String.self, forKey: .domain)
        self.employeeCount = try container.decodeIfPresent(Int.self, forKey: .employeeCount)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.domain, forKey: .domain)
        try container.encodeIfPresent(self.employeeCount, forKey: .employeeCount)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case domain
        case employeeCount
    }
}