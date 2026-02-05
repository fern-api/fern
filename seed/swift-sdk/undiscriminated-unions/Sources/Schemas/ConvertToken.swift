import Foundation

public struct ConvertToken: Codable, Hashable, Sendable {
    public let method: String
    public let tokenId: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        method: String,
        tokenId: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.method = method
        self.tokenId = tokenId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.method = try container.decode(String.self, forKey: .method)
        self.tokenId = try container.decode(String.self, forKey: .tokenId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.method, forKey: .method)
        try container.encode(self.tokenId, forKey: .tokenId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case method
        case tokenId
    }
}