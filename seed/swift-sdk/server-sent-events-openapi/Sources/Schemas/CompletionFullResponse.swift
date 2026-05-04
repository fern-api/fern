import Foundation

/// Full response returned when streaming is disabled.
public struct CompletionFullResponse: Codable, Hashable, Sendable {
    /// The complete generated answer.
    public let answer: String?
    /// Why generation stopped.
    public let finishReason: CompletionFullResponseFinishReason?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        answer: String? = nil,
        finishReason: CompletionFullResponseFinishReason? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.answer = answer
        self.finishReason = finishReason
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.answer = try container.decodeIfPresent(String.self, forKey: .answer)
        self.finishReason = try container.decodeIfPresent(CompletionFullResponseFinishReason.self, forKey: .finishReason)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.answer, forKey: .answer)
        try container.encodeIfPresent(self.finishReason, forKey: .finishReason)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case answer
        case finishReason
    }
}