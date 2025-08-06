public struct NonVoidFunctionDefinitionType: Codable, Hashable, Sendable {
    public let signature: NonVoidFunctionSignatureType
    public let code: FunctionImplementationForMultipleLanguagesType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        signature: NonVoidFunctionSignatureType,
        code: FunctionImplementationForMultipleLanguagesType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.signature = signature
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.signature = try container.decode(NonVoidFunctionSignatureType.self, forKey: .signature)
        self.code = try container.decode(FunctionImplementationForMultipleLanguagesType.self, forKey: .code)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.signature, forKey: .signature)
        try container.encode(self.code, forKey: .code)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case signature
        case code
    }
}