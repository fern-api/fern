import Foundation

public struct PostSubmitResponse: Codable, Hashable, Sendable {
    public let status: Nullable<String>?
    public let message: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        status: Nullable<String>? = nil,
        message: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.status = status
        self.message = message
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.status = try container.decodeNullableIfPresent(String.self, forKey: .status)
        self.message = try container.decodeNullableIfPresent(String.self, forKey: .message)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.status, forKey: .status)
        try container.encodeNullableIfPresent(self.message, forKey: .message)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case status
        case message
    }
}