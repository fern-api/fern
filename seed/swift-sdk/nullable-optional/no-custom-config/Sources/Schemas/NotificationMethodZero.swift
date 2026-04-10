import Foundation

public struct NotificationMethodZero: Codable, Hashable, Sendable {
    public let emailAddress: String
    public let subject: String
    public let htmlContent: Nullable<String>?
    public let type: NotificationMethodZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        emailAddress: String,
        subject: String,
        htmlContent: Nullable<String>? = nil,
        type: NotificationMethodZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.emailAddress = emailAddress
        self.subject = subject
        self.htmlContent = htmlContent
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.emailAddress = try container.decode(String.self, forKey: .emailAddress)
        self.subject = try container.decode(String.self, forKey: .subject)
        self.htmlContent = try container.decodeNullableIfPresent(String.self, forKey: .htmlContent)
        self.type = try container.decode(NotificationMethodZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.emailAddress, forKey: .emailAddress)
        try container.encode(self.subject, forKey: .subject)
        try container.encodeNullableIfPresent(self.htmlContent, forKey: .htmlContent)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case emailAddress
        case subject
        case htmlContent
        case type
    }
}