import Foundation

public struct LightweightStackframeInformation: Codable, Hashable, Sendable {
    public let numStackFrames: Int
    public let topStackFrameMethodName: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        numStackFrames: Int,
        topStackFrameMethodName: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.numStackFrames = numStackFrames
        self.topStackFrameMethodName = topStackFrameMethodName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.numStackFrames = try container.decode(Int.self, forKey: .numStackFrames)
        self.topStackFrameMethodName = try container.decode(String.self, forKey: .topStackFrameMethodName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.numStackFrames, forKey: .numStackFrames)
        try container.encode(self.topStackFrameMethodName, forKey: .topStackFrameMethodName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case numStackFrames
        case topStackFrameMethodName
    }
}