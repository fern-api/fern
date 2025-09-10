import Foundation

public enum TestCaseImplementationReference: Codable, Hashable, Sendable {
    case templateId(TemplateId)
    case implementation(Implementation)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "templateId":
            self = .templateId(try TemplateId(from: decoder))
        case "implementation":
            self = .implementation(try Implementation(from: decoder))
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
        case .templateId(let data):
            try data.encode(to: encoder)
        case .implementation(let data):
            try data.encode(to: encoder)
        }
    }

    public struct TemplateId: Codable, Hashable, Sendable {
        public let type: String = "templateId"
        public let value: TestCaseTemplateId
        /// Additional properties that are not explicitly defined in the schema
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
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct Implementation: Codable, Hashable, Sendable {
        public let type: String = "implementation"
        public let description: TestCaseImplementationDescription
        public let function: TestCaseFunction
        /// Additional properties that are not explicitly defined in the schema
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
            try container.encode(self.type, forKey: .type)
            try container.encode(self.description, forKey: .description)
            try container.encode(self.function, forKey: .function)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case description
            case function
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}