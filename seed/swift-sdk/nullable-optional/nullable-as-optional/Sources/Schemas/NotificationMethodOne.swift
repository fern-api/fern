import Foundation

public struct NotificationMethodOne: Codable, Hashable, Sendable {
    public let phoneNumber: String
    public let message: String
    public let shortCode: Nullable<String>?
    public let type: NotificationMethodOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        phoneNumber: String,
        message: String,
        shortCode: Nullable<String>? = nil,
        type: NotificationMethodOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.phoneNumber = phoneNumber
        self.message = message
        self.shortCode = shortCode
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.phoneNumber = try container.decode(String.self, forKey: .phoneNumber)
        self.message = try container.decode(String.self, forKey: .message)
        self.shortCode = try container.decodeNullableIfPresent(String.self, forKey: .shortCode)
        self.type = try container.decode(NotificationMethodOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.phoneNumber, forKey: .phoneNumber)
        try container.encode(self.message, forKey: .message)
        try container.encodeNullableIfPresent(self.shortCode, forKey: .shortCode)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case phoneNumber
        case message
        case shortCode
        case type
    }
}