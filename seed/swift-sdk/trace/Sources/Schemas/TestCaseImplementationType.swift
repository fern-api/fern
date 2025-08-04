public struct TestCaseImplementationType: Codable, Hashable, Sendable {
    public let description: TestCaseImplementationDescription
    public let function: TestCaseFunction
    public let additionalProperties: [String: JSONValue]

    public init(
        description: TestCaseImplementationDescription,
        function: TestCaseFunction,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.description = description
        self.function = function
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.description = try container.decode(TestCaseImplementationDescription.self, forKey: .description)
        self.function = try container.decode(TestCaseFunction.self, forKey: .function)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.description, forKey: .description)
        try container.encode(self.function, forKey: .function)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case description
        case function
    }
}