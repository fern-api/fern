public enum AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case deepEquality(DeepEquality)
    case custom(Custom)

    public struct DeepEquality: Codable, Hashable, Sendable {
        public let type: String = "deepEquality"
        public let expectedValueParameterId: ParameterId
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            expectedValueParameterId: ParameterId,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.expectedValueParameterId = expectedValueParameterId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.expectedValueParameterId = try container.decode(ParameterId.self, forKey: .expectedValueParameterId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case expectedValueParameterId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let additionalParameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            additionalParameters: [Parameter],
            code: FunctionImplementationForMultipleLanguages,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalParameters = additionalParameters
            self.code = code
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.additionalParameters = try container.decode([Parameter].self, forKey: .additionalParameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.additionalParameters, forKey: .additionalParameters)
            try container.encode(self.code, forKey: .code)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case additionalParameters = "placeholder"
            case code = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}