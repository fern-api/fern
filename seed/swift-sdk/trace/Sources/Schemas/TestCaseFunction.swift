public enum TestCaseFunction: Codable, Hashable, Sendable {
    case withActualResult(WithActualResult)
    case custom(Custom)

    public struct WithActualResult: Codable, Hashable, Sendable {
        public let type: String = "withActualResult"
        public let getActualResult: NonVoidFunctionDefinition
        public let assertCorrectnessCheck: AssertCorrectnessCheck
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            getActualResult: NonVoidFunctionDefinition,
            assertCorrectnessCheck: AssertCorrectnessCheck,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.getActualResult = getActualResult
            self.assertCorrectnessCheck = assertCorrectnessCheck
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.getActualResult = try container.decode(NonVoidFunctionDefinition.self, forKey: .getActualResult)
            self.assertCorrectnessCheck = try container.decode(AssertCorrectnessCheck.self, forKey: .assertCorrectnessCheck)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.getActualResult, forKey: .getActualResult)
            try container.encode(self.assertCorrectnessCheck, forKey: .assertCorrectnessCheck)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case getActualResult = "placeholder"
            case assertCorrectnessCheck = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let parameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            parameters: [Parameter],
            code: FunctionImplementationForMultipleLanguages,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.code = code
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([Parameter].self, forKey: .parameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.code, forKey: .code)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case parameters = "placeholder"
            case code = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}