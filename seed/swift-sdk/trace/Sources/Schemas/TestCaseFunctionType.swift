import Foundation

public enum TestCaseFunctionType: Codable, Hashable, Sendable {
    case withActualResult(WithActualResult)
    case custom(Custom)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "withActualResult":
            self = .withActualResult(try WithActualResult(from: decoder))
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
        case .withActualResult(let data):
            try data.encode(to: encoder)
        case .custom(let data):
            try data.encode(to: encoder)
        }
    }

    public struct WithActualResult: Codable, Hashable, Sendable {
        public let type: String = "withActualResult"
        public let getActualResult: NonVoidFunctionDefinitionType
        public let assertCorrectnessCheck: AssertCorrectnessCheckType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            getActualResult: NonVoidFunctionDefinitionType,
            assertCorrectnessCheck: AssertCorrectnessCheckType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.getActualResult = getActualResult
            self.assertCorrectnessCheck = assertCorrectnessCheck
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.getActualResult = try container.decode(NonVoidFunctionDefinitionType.self, forKey: .getActualResult)
            self.assertCorrectnessCheck = try container.decode(AssertCorrectnessCheckType.self, forKey: .assertCorrectnessCheck)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.getActualResult, forKey: .getActualResult)
            try container.encode(self.assertCorrectnessCheck, forKey: .assertCorrectnessCheck)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case getActualResult
            case assertCorrectnessCheck
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let parameters: [ParameterType]
        public let code: FunctionImplementationForMultipleLanguagesType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            parameters: [ParameterType],
            code: FunctionImplementationForMultipleLanguagesType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.code = code
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguagesType.self, forKey: .code)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.code, forKey: .code)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case parameters
            case code
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}