import Foundation

public struct ClientResponse: Codable, Hashable, Sendable {
    public let client: ClientWithId?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        client: ClientWithId? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.client = client
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.client = try container.decodeIfPresent(ClientWithId.self, forKey: .client)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.client, forKey: .client)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case client
    }
}