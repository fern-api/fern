import Foundation

public struct SearchResultOne: Codable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let domain: Nullable<String>
    public let employeeCount: Nullable<Int>?
    public let type: SearchResultOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        domain: Nullable<String>,
        employeeCount: Nullable<Int>? = nil,
        type: SearchResultOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.domain = domain
        self.employeeCount = employeeCount
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.domain = try container.decode(Nullable<String>.self, forKey: .domain)
        self.employeeCount = try container.decodeNullableIfPresent(Int.self, forKey: .employeeCount)
        self.type = try container.decode(SearchResultOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.domain, forKey: .domain)
        try container.encodeNullableIfPresent(self.employeeCount, forKey: .employeeCount)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case domain
        case employeeCount
        case type
    }
}