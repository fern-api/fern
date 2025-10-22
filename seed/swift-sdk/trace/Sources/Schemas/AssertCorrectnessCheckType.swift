import Foundation

public enum AssertCorrectnessCheckType: Codable, Hashable, Sendable {
    case custom(Custom)
    case deepEquality(DeepEquality)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "custom":
            self = .custom(try Custom(from: decoder))
        case "deepEquality":
            self = .deepEquality(try DeepEquality(from: decoder))
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
        case .custom(let data):
            try data.encode(to: encoder)
        case .deepEquality(let data):
            try data.encode(to: encoder)
        }
    }

    public struct DeepEquality: Codable, Hashable, Sendable {
        public let type: String = "deepEquality"
        public let expectedValueParameterId: ParameterIdType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            expectedValueParameterId: ParameterIdType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.expectedValueParameterId = expectedValueParameterId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.expectedValueParameterId = try container.decode(ParameterIdType.self, forKey: .expectedValueParameterId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case expectedValueParameterId
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let additionalParameters: [ParameterType]
        public let code: FunctionImplementationForMultipleLanguagesType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalParameters: [ParameterType],
            code: FunctionImplementationForMultipleLanguagesType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalParameters = additionalParameters
            self.code = code
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.additionalParameters = try container.decode([ParameterType].self, forKey: .additionalParameters)
            self.code = try container.decode(FunctionImplementationForMultipleLanguagesType.self, forKey: .code)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.additionalParameters, forKey: .additionalParameters)
            try container.encode(self.code, forKey: .code)
        }

        /// Keys for encoding/decoding struct properties.
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