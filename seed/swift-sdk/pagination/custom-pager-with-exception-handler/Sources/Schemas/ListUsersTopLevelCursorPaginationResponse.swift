import Foundation

public struct ListUsersTopLevelCursorPaginationResponse: Codable, Hashable, Sendable {
    public let nextCursor: String?
    public let data: [UserType]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        nextCursor: String? = nil,
        data: [UserType],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nextCursor = nextCursor
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nextCursor = try container.decodeIfPresent(String.self, forKey: .nextCursor)
        self.data = try container.decode([UserType].self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.nextCursor, forKey: .nextCursor)
        try container.encode(self.data, forKey: .data)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case nextCursor = "next_cursor"
        case data
    }
}