import Foundation

public struct V2V3GetBasicSolutionFileRequest: Codable, Hashable, Sendable {
    public let methodName: String
    public let signature: V2V3NonVoidFunctionSignature
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        methodName: String,
        signature: V2V3NonVoidFunctionSignature,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.methodName = methodName
        self.signature = signature
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.methodName = try container.decode(String.self, forKey: .methodName)
        self.signature = try container.decode(V2V3NonVoidFunctionSignature.self, forKey: .signature)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.methodName, forKey: .methodName)
        try container.encode(self.signature, forKey: .signature)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case methodName
        case signature
    }
}