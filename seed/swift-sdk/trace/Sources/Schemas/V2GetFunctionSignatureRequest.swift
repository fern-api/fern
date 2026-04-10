import Foundation

public struct V2GetFunctionSignatureRequest: Codable, Hashable, Sendable {
    public let functionSignature: V2FunctionSignature
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        functionSignature: V2FunctionSignature,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.functionSignature = functionSignature
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.functionSignature = try container.decode(V2FunctionSignature.self, forKey: .functionSignature)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.functionSignature, forKey: .functionSignature)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case functionSignature
    }
}