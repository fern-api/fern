import Foundation

/// A user input message. Inherits stream_response from base via allOf.
public struct UnionStreamMessageVariant: Codable, Hashable, Sendable {
    /// Whether to stream the response.
    public let streamResponse: Bool?
    /// The input prompt.
    public let prompt: String
    /// The message content.
    public let message: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        streamResponse: Bool? = nil,
        prompt: String,
        message: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.streamResponse = streamResponse
        self.prompt = prompt
        self.message = message
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.streamResponse = try container.decodeIfPresent(Bool.self, forKey: .streamResponse)
        self.prompt = try container.decode(String.self, forKey: .prompt)
        self.message = try container.decode(String.self, forKey: .message)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.streamResponse, forKey: .streamResponse)
        try container.encode(self.prompt, forKey: .prompt)
        try container.encode(self.message, forKey: .message)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case streamResponse = "stream_response"
        case prompt
        case message
    }
}