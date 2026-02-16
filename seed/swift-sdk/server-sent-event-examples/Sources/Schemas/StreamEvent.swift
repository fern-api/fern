import Foundation

public enum StreamEvent: Codable, Hashable, Sendable {
    case completion(Completion)
    case error(Error)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .event)
        switch discriminant {
        case "completion":
            self = .completion(try Completion(from: decoder))
        case "error":
            self = .error(try Error(from: decoder))
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
        case .completion(let data):
            try data.encode(to: encoder)
        case .error(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Completion: Codable, Hashable, Sendable {
        public let event: String = "completion"
        public let content: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            content: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.content = content
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.content = try container.decode(String.self, forKey: .content)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.event, forKey: .event)
            try container.encode(self.content, forKey: .content)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case event
            case content
        }
    }

    public struct Error: Codable, Hashable, Sendable {
        public let event: String = "error"
        public let error: String
        public let code: Int?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            error: String,
            code: Int? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.error = error
            self.code = code
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.error = try container.decode(String.self, forKey: .error)
            self.code = try container.decodeIfPresent(Int.self, forKey: .code)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.event, forKey: .event)
            try container.encode(self.error, forKey: .error)
            try container.encodeIfPresent(self.code, forKey: .code)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case event
            case error
            case code
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case event
    }
}