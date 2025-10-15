import Foundation

public enum TestCaseFunction: Codable, Hashable, Sendable {
    case custom(Custom)
    case withActualResult(WithActualResult)

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
        public let getActualResult: NonVoidFunctionDefinition
        public let assertCorrectnessCheck: AssertCorrectnessCheck
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            getActualResult: NonVoidFunctionDefinition,
            assertCorrectnessCheck: AssertCorrectnessCheck,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.getActualResult = getActualResult
            self.assertCorrectnessCheck = assertCorrectnessCheck
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.getActualResult = try container.decode(NonVoidFunctionDefinition.self, forKey: .getActualResult)
            self.assertCorrectnessCheck = try container.decode(AssertCorrectnessCheck.self, forKey: .assertCorrectnessCheck)
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
        public let parameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            parameters: [Parameter],
            code: FunctionImplementationForMultipleLanguages,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.code = code
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([Parameter].self, forKey: .parameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
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