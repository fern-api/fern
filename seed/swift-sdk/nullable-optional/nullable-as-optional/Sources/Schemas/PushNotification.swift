import Foundation

public struct PushNotification: Codable, Hashable, Sendable {
    public let deviceToken: String
    public let title: String
    public let body: String
    public let badge: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        deviceToken: String,
        title: String,
        body: String,
        badge: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.deviceToken = deviceToken
        self.title = title
        self.body = body
        self.badge = badge
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.deviceToken = try container.decode(String.self, forKey: .deviceToken)
        self.title = try container.decode(String.self, forKey: .title)
        self.body = try container.decode(String.self, forKey: .body)
        self.badge = try container.decodeIfPresent(Int.self, forKey: .badge)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.deviceToken, forKey: .deviceToken)
        try container.encode(self.title, forKey: .title)
        try container.encode(self.body, forKey: .body)
        try container.encodeIfPresent(self.badge, forKey: .badge)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case deviceToken
        case title
        case body
        case badge
    }
}