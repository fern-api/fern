import Foundation

public struct StreamEventOne: Codable, Hashable, Sendable {
    public let error: String
    public let code: Nullable<Int>?
    public let event: StreamEventOneEvent
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        error: String,
        code: Nullable<Int>? = nil,
        event: StreamEventOneEvent,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.error = error
        self.code = code
        self.event = event
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.error = try container.decode(String.self, forKey: .error)
        self.code = try container.decodeNullableIfPresent(Int.self, forKey: .code)
        self.event = try container.decode(StreamEventOneEvent.self, forKey: .event)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.error, forKey: .error)
        try container.encodeNullableIfPresent(self.code, forKey: .code)
        try container.encode(self.event, forKey: .event)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case error
        case code
        case event
    }
}