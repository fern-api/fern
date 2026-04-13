import Foundation

public struct InlineUsersUserPage: Codable, Hashable, Sendable {
    public let data: InlineUsersUserListContainer
    public let next: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        data: InlineUsersUserListContainer,
        next: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.data = data
        self.next = next
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.data = try container.decode(InlineUsersUserListContainer.self, forKey: .data)
        self.next = try container.decodeNullableIfPresent(String.self, forKey: .next)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.data, forKey: .data)
        try container.encodeNullableIfPresent(self.next, forKey: .next)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case data
        case next
    }
}