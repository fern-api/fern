public struct NonVoidFunctionDefinition_: Codable, Hashable, Sendable {
    public let signature: NonVoidFunctionSignature
    public let code: FunctionImplementationForMultipleLanguages
    public let additionalProperties: [String: JSONValue]

    public init(
        signature: NonVoidFunctionSignature,
        code: FunctionImplementationForMultipleLanguages,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.signature = signature
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.signature = try container.decode(NonVoidFunctionSignature.self, forKey: .signature)
        self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.signature, forKey: .signature)
        try container.encode(self.code, forKey: .code)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case signature
        case code
    }
}