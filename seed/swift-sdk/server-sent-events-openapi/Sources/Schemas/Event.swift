import Foundation

public struct Event: Codable, Hashable, Sendable {
    public let data: String
    public let event: String?
    public let id: String?
    public let retry: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        data: String,
        event: String? = nil,
        id: String? = nil,
        retry: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.data = data
        self.event = event
        self.id = id
        self.retry = retry
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.data = try container.decode(String.self, forKey: .data)
        self.event = try container.decodeIfPresent(String.self, forKey: .event)
        self.id = try container.decodeIfPresent(String.self, forKey: .id)
        self.retry = try container.decodeIfPresent(Int.self, forKey: .retry)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.data, forKey: .data)
        try container.encodeIfPresent(self.event, forKey: .event)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.retry, forKey: .retry)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case data
        case event
        case id
        case retry
    }
}