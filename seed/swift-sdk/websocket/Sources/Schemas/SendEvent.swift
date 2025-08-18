import Foundation

public struct SendEvent: Codable, Hashable, Sendable {
    public let sendText: String
    public let sendParam: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        sendText: String,
        sendParam: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.sendText = sendText
        self.sendParam = sendParam
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.sendText = try container.decode(String.self, forKey: .sendText)
        self.sendParam = try container.decode(Int.self, forKey: .sendParam)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.sendText, forKey: .sendText)
        try container.encode(self.sendParam, forKey: .sendParam)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case sendText
        case sendParam
    }
}