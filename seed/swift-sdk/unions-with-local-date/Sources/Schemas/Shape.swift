import Foundation

public enum Shape: Codable, Hashable, Sendable {
    case circle(Circle)
    case square(Square)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "circle":
            self = .circle(try Circle(from: decoder))
        case "square":
            self = .square(try Square(from: decoder))
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
        case .circle(let data):
            try data.encode(to: encoder)
        case .square(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Circle: Codable, Hashable, Sendable {
        public let type: String = "circle"
        public let radius: Double
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            radius: Double,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.radius = radius
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.radius = try container.decode(Double.self, forKey: .radius)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.radius, forKey: .radius)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case radius
        }
    }

    public struct Square: Codable, Hashable, Sendable {
        public let type: String = "square"
        public let length: Double
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            length: Double,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.length = length
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.length = try container.decode(Double.self, forKey: .length)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.length, forKey: .length)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case length
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}