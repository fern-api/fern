import Foundation

public enum Data: Codable, Hashable, Sendable {
    case base64(Base64)
    case string(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(Swift.String.self, forKey: .type)
        switch discriminant {
        case "base64":
            self = .base64(try Base64(from: decoder))
        case "string":
            self = .string(try String(from: decoder))
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
        case .base64(let data):
            try data.encode(to: encoder)
        case .string(let data):
            try data.encode(to: encoder)
        }
    }

    public struct String: Codable, Hashable, Sendable {
        public let type: Swift.String = "string"
        public let value: Swift.String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [Swift.String: JSONValue]

        public init(
            value: Swift.String,
            additionalProperties: [Swift.String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Swift.String.self, forKey: .value)
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

    public struct Base64: Codable, Hashable, Sendable {
        public let type: Swift.String = "base64"
        public let value: Swift.String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [Swift.String: JSONValue]

        public init(
            value: Swift.String,
            additionalProperties: [Swift.String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Swift.String.self, forKey: .value)
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

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}