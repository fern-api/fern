public enum AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case deepEquality(DeepEquality)
    case custom(Custom)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "deepEquality":
            self = .deepEquality(try DeepEquality(from: decoder))
        case "custom":
            self = .custom(try Custom(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .deepEquality(let data):
            try data.encode(to: encoder)
        case .custom(let data):
            try data.encode(to: encoder)
        }
    }

    public struct DeepEquality: Codable, Hashable, Sendable {
        public let type: String = "deepEquality"
        public let expectedValueParameterId: ParameterId
        public let additionalProperties: [String: JSONValue]

        public init(
            expectedValueParameterId: ParameterId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.expectedValueParameterId = expectedValueParameterId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.expectedValueParameterId = try container.decode(ParameterId.self, forKey: .expectedValueParameterId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case expectedValueParameterId
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let additionalParameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalParameters: [Parameter],
            code: FunctionImplementationForMultipleLanguages,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalParameters = additionalParameters
            self.code = code
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.additionalParameters = try container.decode([Parameter].self, forKey: .additionalParameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.additionalParameters, forKey: .additionalParameters)
            try container.encode(self.code, forKey: .code)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case additionalParameters
            case code
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}