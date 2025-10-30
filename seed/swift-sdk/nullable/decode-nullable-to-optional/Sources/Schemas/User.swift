import Foundation

public struct User: Codable, Hashable, Sendable {
    public let name: String
    public let id: UserId
    public let tags: [String]?
    public let metadata: Metadata?
    public let email: Email
    public let favoriteNumber: WeirdNumber
    public let numbers: [Int]?
    public let strings: [String: JSONValue]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        id: UserId,
        tags: [String]? = nil,
        metadata: Metadata? = nil,
        email: Email,
        favoriteNumber: WeirdNumber,
        numbers: [Int]? = nil,
        strings: [String: JSONValue]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.id = id
        self.tags = tags
        self.metadata = metadata
        self.email = email
        self.favoriteNumber = favoriteNumber
        self.numbers = numbers
        self.strings = strings
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.id = try container.decode(UserId.self, forKey: .id)
        self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
        self.metadata = try container.decodeIfPresent(Metadata.self, forKey: .metadata)
        self.email = try container.decode(Email.self, forKey: .email)
        self.favoriteNumber = try container.decode(WeirdNumber.self, forKey: .favoriteNumber)
        self.numbers = try container.decodeIfPresent([Int].self, forKey: .numbers)
        self.strings = try container.decodeIfPresent([String: JSONValue].self, forKey: .strings)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.tags, forKey: .tags)
        try container.encodeIfPresent(self.metadata, forKey: .metadata)
        try container.encode(self.email, forKey: .email)
        try container.encode(self.favoriteNumber, forKey: .favoriteNumber)
        try container.encodeIfPresent(self.numbers, forKey: .numbers)
        try container.encodeIfPresent(self.strings, forKey: .strings)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case id
        case tags
        case metadata
        case email
        case favoriteNumber = "favorite-number"
        case numbers
        case strings
    }
}