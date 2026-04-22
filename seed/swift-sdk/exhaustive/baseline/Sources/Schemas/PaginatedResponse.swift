import Foundation

public struct PaginatedResponse: Codable, Hashable, Sendable {
    public let items: [ObjectWithRequiredField]
    public let next: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        items: [ObjectWithRequiredField],
        next: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.items = items
        self.next = next
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.items = try container.decode([ObjectWithRequiredField].self, forKey: .items)
        self.next = try container.decodeIfPresent(String.self, forKey: .next)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.items, forKey: .items)
        try container.encodeIfPresent(self.next, forKey: .next)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case items
        case next
    }
}