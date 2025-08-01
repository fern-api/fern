public enum TestCaseImplementationReference: Codable, Hashable, Sendable {
    case templateId(TemplateId)
    case implementation(Implementation)

    public struct TemplateId: Codable, Hashable, Sendable {
        public let type: String = "templateId"
        public let value: TestCaseTemplateId
        public let additionalProperties: [String: JSONValue]

        public init(
            value: TestCaseTemplateId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(TestCaseTemplateId.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case value
        }
    }

    public struct Implementation: Codable, Hashable, Sendable {
        public let type: String = "implementation"
        public let description: TestCaseImplementationDescription
        public let function: TestCaseFunction
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            description: TestCaseImplementationDescription,
            function: TestCaseFunction,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.description = description
            self.function = function
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.description = try container.decode(TestCaseImplementationDescription.self, forKey: .description)
            self.function = try container.decode(TestCaseFunction.self, forKey: .function)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.description, forKey: .description)
            try container.encode(self.function, forKey: .function)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case description = "placeholder"
            case function = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}