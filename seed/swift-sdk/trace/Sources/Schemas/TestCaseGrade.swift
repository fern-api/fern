public enum TestCaseGrade: Codable, Hashable, Sendable {
    case hidden(Hidden)
    case nonHidden(NonHidden)

    public struct Hidden: Codable, Hashable, Sendable {
        public let type: String = "hidden"
        public let passed: Bool
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            passed: Bool,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.passed = passed
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.passed = try container.decode(Bool.self, forKey: .passed)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.passed, forKey: .passed)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case passed = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct NonHidden: Codable, Hashable, Sendable {
        public let type: String = "nonHidden"
        public let passed: Bool
        public let actualResult: VariableValue?
        public let exception: ExceptionV2?
        public let stdout: String
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            passed: Bool,
            actualResult: VariableValue? = nil,
            exception: ExceptionV2? = nil,
            stdout: String,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.passed = passed
            self.actualResult = actualResult
            self.exception = exception
            self.stdout = stdout
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.passed = try container.decode(Bool.self, forKey: .passed)
            self.actualResult = try container.decodeIfPresent(VariableValue.self, forKey: .actualResult)
            self.exception = try container.decodeIfPresent(ExceptionV2.self, forKey: .exception)
            self.stdout = try container.decode(String.self, forKey: .stdout)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.passed, forKey: .passed)
            try container.encodeIfPresent(self.actualResult, forKey: .actualResult)
            try container.encodeIfPresent(self.exception, forKey: .exception)
            try container.encode(self.stdout, forKey: .stdout)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case passed = "placeholder"
            case actualResult = "placeholder"
            case exception = "placeholder"
            case stdout = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}