import Foundation

public enum Animal: Codable, Hashable, Sendable {
    case cat(Cat)
    case dog(Dog)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .animal)
        switch discriminant {
        case "cat":
            self = .cat(try Cat(from: decoder))
        case "dog":
            self = .dog(try Dog(from: decoder))
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
        case .cat(let data):
            try data.encode(to: encoder)
        case .dog(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Dog: Codable, Hashable, Sendable {
        public let animal: String = "dog"
        public let name: String
        public let likesToWoof: Bool
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            likesToWoof: Bool,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.likesToWoof = likesToWoof
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.likesToWoof = try container.decode(Bool.self, forKey: .likesToWoof)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.animal, forKey: .animal)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.likesToWoof, forKey: .likesToWoof)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case animal
            case name
            case likesToWoof
        }
    }

    public struct Cat: Codable, Hashable, Sendable {
        public let animal: String = "cat"
        public let name: String
        public let likesToMeow: Bool
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            likesToMeow: Bool,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.likesToMeow = likesToMeow
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.likesToMeow = try container.decode(Bool.self, forKey: .likesToMeow)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.animal, forKey: .animal)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.likesToMeow, forKey: .likesToMeow)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case animal
            case name
            case likesToMeow
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case animal
    }
}