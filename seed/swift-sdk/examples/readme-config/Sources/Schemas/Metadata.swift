import Foundation

public struct Metadata: Codable, Hashable, Sendable {
    public let id: String
    public let data: [String: String]?
    public let jsonString: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        data: [String: String]? = nil,
        jsonString: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.data = data
        self.jsonString = jsonString
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.data = try container.decodeIfPresent([String: String].self, forKey: .data)
        self.jsonString = try container.decodeIfPresent(String.self, forKey: .jsonString)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.data, forKey: .data)
        try container.encodeIfPresent(self.jsonString, forKey: .jsonString)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case data
        case jsonString
    }
}